const API_BASE = "https://library-management-system-production-5be5.up.railway.app/api";
let token = localStorage.getItem("lms_token") || "";

const socket = io("https://library-management-system-production-5be5.up.railway.app");

// UI elements
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMsg = document.getElementById("auth-msg");
const authCard = document.getElementById("auth-card");
const booksSection = document.getElementById("books-section");
const booksList = document.getElementById("books-list");
const userInfo = document.getElementById("user-info");
const logoutBtn = document.getElementById("logout-btn");

// Initialize
init();

// --- Initialization ---
function init() {
  tabLogin.addEventListener("click", () => toggleTab("login"));
  tabRegister.addEventListener("click", () => toggleTab("register"));

  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);
  logoutBtn.addEventListener("click", handleLogout);

  if (token) autoLogin();
}

// --- Tab Toggle ---
function toggleTab(tab) {
  tab === "login" ? showLogin() : showRegister();
}

function showLogin() {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  clearAuthMsg();
  clearForm(registerForm);
}

function showRegister() {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  clearAuthMsg();
  clearForm(loginForm);
}

function clearAuthMsg() {
  authMsg.textContent = "";
}

function clearForm(form) {
  form.querySelectorAll("input").forEach(input => input.value = "");
}

// --- Login ---
async function handleLogin(e) {
  e.preventDefault();
  clearAuthMsg();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    authMsg.textContent = "Please fill in all fields.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      authMsg.textContent = data.message || "Login failed";
      return;
    }
    token = data.token;
    localStorage.setItem("lms_token", token);
    clearForm(loginForm);
    showBooksView(data.user);
  } catch {
    authMsg.textContent = "Network error. Try again.";
  }
}

// --- Register ---
async function handleRegister(e) {
  e.preventDefault();
  clearAuthMsg();

  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  if (!name || !email || !password) {
    authMsg.textContent = "Please fill in all fields.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      authMsg.textContent = data.message || "Registration failed";
      return;
    }
    authMsg.textContent = "Registered successfully. Please login.";
    clearForm(registerForm);
    showLogin();
  } catch {
    authMsg.textContent = "Network error. Try again.";
  }
}

// --- Show Books ---
function showBooksView(user) {
  authCard.classList.add("hidden");
  booksSection.classList.remove("hidden");
  userInfo.textContent = `${user.name} (${user.role})`;
  loadBooks();
}

// --- Logout ---
function handleLogout() {
  token = "";
  localStorage.removeItem("lms_token");
  authCard.classList.remove("hidden");
  booksSection.classList.add("hidden");
  clearForm(loginForm);
  clearForm(registerForm);
  clearAuthMsg();
}

// --- Load Books ---
async function loadBooks() {
  try {
    const res = await fetch(`${API_BASE}/books`);
    const books = await res.json();
    booksList.innerHTML = "";

    if (!books.length) {
      booksList.innerHTML = "<p>No books available</p>";
      return;
    }

    books.forEach(book => {
      const div = document.createElement("div");
      div.className = "book-card";
      div.innerHTML = `
        <h3>${book.title}</h3>
        <div class="muted">${book.author}</div>
        <div class="muted">Category: ${book.category || 'N/A'}</div>
        <div style="margin-top:8px">
          <button ${book.isAvailable ? "" : "disabled"} data-id="${book._id}" class="btn borrow-btn">
            ${book.isAvailable ? "Borrow" : "Unavailable"}
          </button>
        </div>
      `;
      booksList.appendChild(div);
    });

    document.querySelectorAll(".borrow-btn").forEach(btn => btn.addEventListener("click", borrowBook));
  } catch (err) {
    booksList.innerHTML = "<p>Error loading books. Try again later.</p>";
    console.error(err);
  }
}

// --- Borrow Book ---
async function borrowBook(e) {
  const id = e.target.getAttribute("data-id");
  try {
    const res = await fetch(`${API_BASE}/books/${id}/borrow`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    alert(data.message || "Borrowed");
    loadBooks();
  } catch (err) {
    console.error(err);
    alert("Error borrowing book. Try again.");
  }
}

// --- Socket Updates ---
socket.on("book-updated", loadBooks);

// --- Auto-login ---
async function autoLogin() {
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      const me = await res.json();
      showBooksView(me);
    } else {
      handleLogout();
    }
  } catch {
    handleLogout();
  }
}
