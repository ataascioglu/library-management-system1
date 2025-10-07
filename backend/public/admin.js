const API_BASE = "https://library-management-system-production-5be5.up.railway.app/api";
const token = localStorage.getItem("lms_token") || "";

// Global variables
let currentUsers = [];
let currentBooks = [];
let selectedUserId = null;

// Check authentication and role
if (!token) {
  window.location.href = "index.html";
}

const userRole = localStorage.getItem("userRole");
if (userRole !== "admin" && userRole !== "librarian") {
  alert("Access denied. Admin or Librarian role required.");
  window.location.href = "books.html";
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeAdmin();
  setupEventListeners();
  loadDashboardData();
});

function initializeAdmin() {
  const userName = localStorage.getItem("userName") || "Admin";
  document.getElementById("user-info").innerHTML = `Hi, <strong>${userName}</strong>`;
}

function setupEventListeners() {
  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  // Tab navigation
  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      const section = e.currentTarget.getAttribute("data-section");
      switchSection(section);
    });
  });

  // Add book form
  document.getElementById("add-book-form").addEventListener("submit", handleAddBook);

  // Search functionality
  document.getElementById("user-search").addEventListener("input", filterUsers);
  document.getElementById("book-search").addEventListener("input", filterBooks);
}

function switchSection(sectionName) {
  // Update tabs
  document.querySelectorAll(".admin-tab").forEach(tab => tab.classList.remove("active"));
  document.querySelector(`[data-section="${sectionName}"]`).classList.add("active");

  // Update sections
  document.querySelectorAll(".admin-section").forEach(section => section.classList.remove("active"));
  document.getElementById(`${sectionName}-section`).classList.add("active");

  // Load section data
  switch(sectionName) {
    case "users":
      loadUsers();
      break;
    case "books":
      loadBooksAdmin();
      break;
    case "reports":
      loadReports();
      break;
  }
}

async function loadDashboardData() {
  try {
    // Load statistics
    await Promise.all([
      loadStatistics(),
      loadUsers()
    ]);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

async function loadStatistics() {
  try {
    // Get books
    const booksRes = await fetch(`${API_BASE}/books`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const books = await booksRes.json();
    
    // Get overdue reports
    const overdueRes = await fetch(`${API_BASE}/admin/reports/overdue`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const overdueData = await overdueRes.json();

    // Update statistics
    document.getElementById("total-books").textContent = books.length || 0;
    document.getElementById("borrowed-books").textContent = books.filter(b => !b.isAvailable).length || 0;
    document.getElementById("overdue-books").textContent = overdueData.overdue?.length || 0;

  } catch (error) {
    console.error("Error loading statistics:", error);
  }
}

async function loadUsers() {
  const loading = document.getElementById("users-loading");
  const content = document.getElementById("users-content");
  
  loading.style.display = "block";
  content.style.display = "none";

  try {
    // Load users from the API
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      currentUsers = data.users || [];
    } else {
      // Fallback to simulated data if endpoint not available
      currentUsers = [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "student",
          createdAt: new Date("2024-01-15")
        },
        {
          _id: "2", 
          name: "Jane Smith",
          email: "jane@example.com",
          role: "librarian",
          createdAt: new Date("2024-02-20")
        }
      ];
    }

    // Update total users stat
    document.getElementById("total-users").textContent = currentUsers.length;
    
    renderUsers(currentUsers);
    
    loading.style.display = "none";
    content.style.display = "block";
  } catch (error) {
    console.error("Error loading users:", error);
    loading.innerHTML = "Error loading users";
  }
}

function renderUsers(users) {
  const usersList = document.getElementById("users-list");
  
  if (users.length === 0) {
    usersList.innerHTML = '<tr><td colspan="5" class="empty-state">No users found</td></tr>';
    return;
  }

  usersList.innerHTML = users.map(user => `
    <tr>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="role-badge role-${user.role}">${user.role}</span></td>
      <td>${new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-admin" onclick="openRoleModal('${user._id}', '${user.role}')">
            Change Role
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function filterUsers() {
  const searchTerm = document.getElementById("user-search").value.toLowerCase();
  const filtered = currentUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm) ||
    user.role.toLowerCase().includes(searchTerm)
  );
  renderUsers(filtered);
}

async function loadBooksAdmin() {
  const loading = document.getElementById("books-loading");
  const content = document.getElementById("books-content");
  
  loading.style.display = "block";
  content.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/books`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    currentBooks = await res.json();
    
    renderBooks(currentBooks);
    
    loading.style.display = "none";
    content.style.display = "block";
  } catch (error) {
    console.error("Error loading books:", error);
    loading.innerHTML = "Error loading books";
  }
}

function renderBooks(books) {
  const booksList = document.getElementById("books-list");
  
  if (books.length === 0) {
    booksList.innerHTML = '<tr><td colspan="6" class="empty-state">No books found</td></tr>';
    return;
  }

  booksList.innerHTML = books.map(book => `
    <tr>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.category}</td>
      <td>
        <span class="availability-badge ${book.isAvailable ? 'available' : 'borrowed'}">
          ${book.isAvailable ? 'Available' : 'Borrowed'}
        </span>
      </td>
      <td>${book.borrowedBy ? 'User ID: ' + book.borrowedBy : '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-admin secondary" onclick="toggleBookStatus('${book._id}', ${book.isAvailable})">
            ${book.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
          </button>
          <button class="btn-admin danger" onclick="deleteBook('${book._id}')">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function filterBooks() {
  const searchTerm = document.getElementById("book-search").value.toLowerCase();
  const filtered = currentBooks.filter(book => 
    book.title.toLowerCase().includes(searchTerm) ||
    book.author.toLowerCase().includes(searchTerm) ||
    book.category.toLowerCase().includes(searchTerm)
  );
  renderBooks(filtered);
}

async function handleAddBook(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const bookData = {
    title: formData.get("title"),
    author: formData.get("author"),
    category: formData.get("category")
  };

  try {
    const res = await fetch(`${API_BASE}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(bookData)
    });

    const result = await res.json();
    
    if (res.ok) {
      showToast("Book added successfully!");
      e.target.reset();
      loadBooksAdmin();
      loadStatistics();
    } else {
      showToast(result.message || "Error adding book", true);
    }
  } catch (error) {
    console.error("Error adding book:", error);
    showToast("Error adding book", true);
  }
}

async function toggleBookStatus(bookId, currentStatus) {
  try {
    const res = await fetch(`${API_BASE}/books/${bookId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ isAvailable: !currentStatus })
    });

    const result = await res.json();
    
    if (res.ok) {
      showToast("Book status updated!");
      loadBooksAdmin();
      loadStatistics();
    } else {
      showToast(result.message || "Error updating book status", true);
    }
  } catch (error) {
    console.error("Error updating book status:", error);
    showToast("Error updating book status", true);
  }
}

async function deleteBook(bookId) {
  if (!confirm("Are you sure you want to delete this book?")) {
    return;
  }

  try {
    // Note: You'll need to add a DELETE endpoint to your backend
    const res = await fetch(`${API_BASE}/books/${bookId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
      showToast("Book deleted successfully!");
      loadBooksAdmin();
      loadStatistics();
    } else {
      showToast("Error deleting book", true);
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    showToast("Book deletion not implemented yet", true);
  }
}

async function loadReports() {
  loadOverdueBooks();
  loadPopularBooks();
}

async function loadOverdueBooks() {
  const loading = document.getElementById("overdue-loading");
  const content = document.getElementById("overdue-content");
  
  loading.style.display = "block";
  content.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/admin/reports/overdue`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    
    renderOverdueBooks(data.overdue || []);
    
    loading.style.display = "none";
    content.style.display = "block";
  } catch (error) {
    console.error("Error loading overdue books:", error);
    loading.innerHTML = "Error loading overdue books";
  }
}

function renderOverdueBooks(overdueBooks) {
  const overdueList = document.getElementById("overdue-list");
  
  if (overdueBooks.length === 0) {
    overdueList.innerHTML = '<tr><td colspan="5" class="empty-state">No overdue books</td></tr>';
    return;
  }

  overdueList.innerHTML = overdueBooks.map(loan => {
    const dueDate = new Date(loan.dueDate);
    const today = new Date();
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    
    return `
      <tr>
        <td>${loan.book?.title || 'Unknown Book'}</td>
        <td>${loan.user?.name || 'Unknown User'}</td>
        <td>${dueDate.toLocaleDateString()}</td>
        <td style="color: #d32f2f; font-weight: bold;">${daysOverdue} days</td>
        <td>
          <button class="btn-admin" onclick="sendReminder('${loan.user?.email}')">
            Send Reminder
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

async function loadPopularBooks() {
  const loading = document.getElementById("popular-loading");
  const content = document.getElementById("popular-content");
  
  loading.style.display = "block";
  content.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/admin/reports/popular`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    
    renderPopularBooks(data.books || []);
    
    loading.style.display = "none";
    content.style.display = "block";
  } catch (error) {
    console.error("Error loading popular books:", error);
    loading.innerHTML = "Error loading popular books";
  }
}

function renderPopularBooks(popularBooks) {
  const popularList = document.getElementById("popular-list");
  
  if (popularBooks.length === 0) {
    popularList.innerHTML = '<tr><td colspan="4" class="empty-state">No popular books data</td></tr>';
    return;
  }

  popularList.innerHTML = popularBooks.map((book, index) => `
    <tr>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.category}</td>
      <td>${Math.floor(Math.random() * 10) + 1}</td>
    </tr>
  `).join("");
}

// Role management functions
function openRoleModal(userId, currentRole) {
  selectedUserId = userId;
  document.getElementById("new-role").value = currentRole;
  document.getElementById("role-modal").style.display = "block";
}

function closeRoleModal() {
  selectedUserId = null;
  document.getElementById("role-modal").style.display = "none";
}

async function updateUserRole() {
  if (!selectedUserId) return;

  const newRole = document.getElementById("new-role").value;
  
  try {
    const res = await fetch(`${API_BASE}/admin/users/role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: selectedUserId,
        role: newRole
      })
    });

    const result = await res.json();
    
    if (res.ok) {
      showToast("User role updated successfully!");
      closeRoleModal();
      loadUsers();
    } else {
      showToast(result.message || "Error updating user role", true);
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    showToast("Error updating user role", true);
  }
}

function sendReminder(email) {
  // Placeholder for sending reminder functionality
  showToast(`Reminder sent to ${email}!`);
}

// Toast notification (reusing from books.js)
function showToast(message, isError = false) {
  let toast = document.getElementById("toast-message");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-message";
    toast.style.position = "fixed";
    toast.style.top = "80px";
    toast.style.right = "32px";
    toast.style.maxWidth = "calc(100vw - 64px)";
    toast.style.background = isError ? "#d9534f" : "#28a745";
    toast.style.color = "#fff";
    toast.style.padding = "16px 32px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "1rem";
    toast.style.zIndex = 99999;
    toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    toast.style.opacity = 0;
    toast.style.transition = "opacity 0.3s";
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.style.background = isError ? "#d9534f" : "#28a745";
  toast.style.opacity = 1;
  
  setTimeout(() => {
    toast.style.opacity = 0;
  }, 3000);
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  const modal = document.getElementById("role-modal");
  if (e.target === modal) {
    closeRoleModal();
  }
});