// BookNest frontend/books.js
const API_BASE = "https://library-management-system-production-5be5.up.railway.app/api";
const token = localStorage.getItem("booknest_token") || "";

const userInfo = document.getElementById("user-info");
const booksList = document.getElementById("books-list");
const logoutBtn = document.getElementById("logout-btn");
const genreBarEl = document.querySelector(".genre-bar");

function getCurrentUserId() {
  return localStorage.getItem("userId") || "";
}

// --- Formatting helpers ---
function toTitleCaseFromSlug(value) {
  if (!value || typeof value !== "string") return "";
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatAuthor(name) {
  if (!name || typeof name !== "string") return "Unknown";
  // Handle formats like "DOE, John" or "Doe, John P."
  if (name.includes(",")) {
    const [last, first] = name.split(",").map(s => s.trim());
    const prettyFirst = toTitleCaseFromSlug(first);
    const prettyLast = toTitleCaseFromSlug(last);
    return `${prettyFirst} ${prettyLast}`.trim();
  }
  // Handle slug/uppercase names
  return toTitleCaseFromSlug(name);
}

async function ensureUserId() {
  if (getCurrentUserId()) return;
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return;
    const me = await res.json();
    if (me && me.id) {
      localStorage.setItem("userId", me.id);
      if (me.name && !localStorage.getItem("userName")) {
        localStorage.setItem("userName", me.name);
      }
    }
  } catch {}
}

// Redirect to login if not authenticated
if (!token) {
  window.location.href = "index.html";
}

userInfo.textContent = `Hi, ${localStorage.getItem("userName") || "User"}`;

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

async function loadBooks() {
  try {
    await ensureUserId();
    const res = await fetch(`${API_BASE}/books`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    // Debug: log status for visibility in DevTools
    // eslint-disable-next-line no-console
    console.log("GET /books status:", res.status);
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "index.html";
      return;
    }
    let data;
    try {
      data = await res.json();
    } catch (e) {
      const text = await res.text();
      // eslint-disable-next-line no-console
      console.error("Failed to parse JSON. Raw response:", text);
      booksList.innerHTML = "<p>Failed to parse server response.</p>";
      return;
    }
    // Debug: log payload shape
    // eslint-disable-next-line no-console
    console.log("/books payload:", data);
    const books = Array.isArray(data)
      ? data
      : (Array.isArray(data && data.books)
          ? data.books
          : (data && typeof data === 'object' ? Object.values(data) : []));

    if (!Array.isArray(books) || books.length === 0) {
      booksList.innerHTML = "<p>No books available or response shape not recognized.</p>";
      return;
    }

    // Normalize and cache
    window.__ALL_BOOKS__ = books.map((book) => {
      const title = book.title ?? book.name ?? book.Title ?? "Untitled";
      const rawAuthor = book.author ?? book.writer ?? book.Author ?? "Unknown";
      const rawCategory = book.category ?? book.genre ?? book.Genre ?? "N/A";
      const author = formatAuthor(rawAuthor);
      const category = toTitleCaseFromSlug(String(rawCategory));
      const isAvailable = (book.isAvailable ?? book.available ?? true) === true;
      const id = book._id || book.id || "";
      const borrowedBy = (book.borrowedBy && (book.borrowedBy._id || book.borrowedBy)) || null;
      return { id, title, author, category, isAvailable, borrowedBy };
    });

    buildGenreButtons(window.__ALL_BOOKS__);
    renderBooks(window.__ALL_BOOKS__);
  } catch (err) {
    booksList.innerHTML = "<p>Error loading books. Try again later.</p>";
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

function buildGenreButtons(allBooks) {
  if (!genreBarEl) return;
  const genres = Array.from(new Set(allBooks.map(b => b.category).filter(Boolean))).sort();

  // Build buttons: All + unique genres
  genreBarEl.innerHTML = "";
  const btnAll = document.createElement("button");
  btnAll.className = "genre-btn active";
  btnAll.innerHTML = `<i class="${getGenreIconClass('all')}"></i> All`;
  btnAll.addEventListener("click", () => {
    setActiveGenreButton(btnAll);
    renderBooks(window.__ALL_BOOKS__);
  });
  genreBarEl.appendChild(btnAll);

  genres.forEach(genre => {
    const btn = document.createElement("button");
    btn.className = "genre-btn";
    btn.innerHTML = `<i class="${getGenreIconClass(genre)}"></i> ${genre}`;
    btn.addEventListener("click", () => {
      setActiveGenreButton(btn);
      const filtered = window.__ALL_BOOKS__.filter(b => b.category === genre);
      renderBooks(filtered);
    });
    genreBarEl.appendChild(btn);
  });
}

function setActiveGenreButton(activeBtn) {
  document.querySelectorAll(".genre-btn").forEach(b => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

function getGenreIconClass(label) {
  const key = String(label || "").toLowerCase();
  // Map common genres to icon classes (from flaticon uicons already linked in books.html)
  if (key.includes("fiction")) return "fi fi-sr-ufo";
  if (key.includes("science")) return "fi fi-sr-physics";
  if (key.includes("history")) return "fi fi-rr-scroll-document-story";
  if (key.includes("biography")) return "fi fi-ss-document";
  if (key.includes("technology") || key.includes("tech")) return "fi fi-sr-microchip";
  if (key.includes("math")) return "fi fi-rr-sigma";
  if (key.includes("data") || key.includes("ai")) return "fi fi-ss-database";
  if (key.includes("business")) return "fi fi-ss-briefcase";
  if (key.includes("economics") || key.includes("economy")) return "fi fi-sr-search-dollar";
  if (key.includes("philosophy")) return "fi fi-ss-yin-yang";
  if (key.includes("psychology")) return "fi fi-sr-head-side-heart";
  if (key.includes("signal") && key.includes("processing")) return "fi fi-sr-broadcast-tower";
  if (key.includes("computer") && key.includes("science")) return "fi fi-sr-devices";
  if (key.includes("art")) return "fi fi-ss-palette";
  if (key.includes("travel")) return "fi fi-ss-globe";
  if (key.includes("health") || key.includes("medical")) return "fi fi-ss-heart-rate";
  if (key.includes("education")) return "fi fi-ss-graduation-cap";
  if (key.includes("poetry")) return "fi fi-ss-feather";
  // default
  return "fi fi-ss-book-open-cover";
}

function renderBooks(list) {
  booksList.innerHTML = "";
  list.forEach((book, idx) => {
    try {
      const isMine = book.borrowedBy && getCurrentUserId() && String(book.borrowedBy) === getCurrentUserId();
      const genreIcon = getGenreIconClass(book.category);
      const card = document.createElement("div");
      card.className = "book-card";
      card.innerHTML = `
        <h3>${book.title} <i class="${genreIcon} genre-icon"></i></h3>
        <div class="muted">${book.author}</div>
        <div class="book-meta">
          <span class="badge">${book.category}</span>
          <div>
            ${book.isAvailable ? `
              <button data-id="${book.id}" class="btn borrow-btn">Borrow</button>
            ` : isMine ? `
              <button data-id="${book.id}" class="btn secondary return-btn">Return</button>
            ` : `
              <button disabled class="btn">Unavailable</button>
            `}
          </div>
        </div>
      `;
      booksList.appendChild(card);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Render error at index", idx, err, book);
    }
  });

  document.querySelectorAll(".borrow-btn").forEach(btn => btn.addEventListener("click", borrowBook));
  document.querySelectorAll(".return-btn").forEach(btn => btn.addEventListener("click", returnBook));
}


// Toast notification helper
function showToast(message, isError = false) {
  let toast = document.getElementById("toast-message");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-message";
    toast.style.position = "fixed";
    toast.style.top = "64px";
    toast.style.right = "32px";
    toast.style.left = "auto";
    toast.style.transform = "none";
    toast.style.maxWidth = "calc(100vw - 64px)";
    toast.style.width = "auto";
    toast.style.minWidth = "180px";
    toast.style.pointerEvents = "none";
    toast.style.display = "flex";
    toast.style.justifyContent = "flex-end";
    toast.style.alignItems = "center";
    toast.style.boxSizing = "border-box";
    toast.style.wordBreak = "break-word";
    toast.style.fontWeight = "500";
    toast.style.textAlign = "right";
    toast.style.margin = 0;
    toast.style.marginTop = 0;
    toast.style.marginRight = 0;
    toast.style.marginLeft = 0;
    toast.style.marginBottom = 0;
    toast.style.userSelect = "none";
    toast.style.background = isError ? "#d9534f" : "#28a745";
    toast.style.color = "#fff";
    toast.style.padding = "16px 32px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "1.1rem";
    toast.style.zIndex = 99999;
    toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    toast.style.opacity = 0;
    toast.style.transition = "opacity 0.3s";
    // Responsive for mobile
    function setToastMobileStyles() {
      if (window.innerWidth < 600) {
        toast.style.top = "56px";
        toast.style.right = "8px";
        toast.style.maxWidth = "calc(100vw - 16px)";
      } else {
        toast.style.top = "64px";
        toast.style.right = "32px";
        toast.style.maxWidth = "calc(100vw - 64px)";
      }
    }
    setToastMobileStyles();
    window.addEventListener("resize", setToastMobileStyles);
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.background = isError ? "#d9534f" : "#28a745";
  toast.style.opacity = 1;
  setTimeout(() => {
    toast.style.opacity = 0;
  }, 2000);
}

async function borrowBook(e) {
  const id = e.currentTarget.getAttribute("data-id");
  try {
    const res = await fetch(`${API_BASE}/books/${id}/borrow`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    showToast(data.message || (res.ok ? "Borrowed" : "Action failed"), !res.ok);
    loadBooks();
  } catch (err) {
    showToast("Error borrowing book. Try again.", true);
  }
}

async function returnBook(e) {
  const id = e.currentTarget.getAttribute("data-id");
  try {
    const res = await fetch(`${API_BASE}/books/${id}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    showToast(data.message || (res.ok ? "Returned" : "Action failed"), !res.ok);
    loadBooks();
  } catch (err) {
    showToast("Error returning book. Try again.", true);
  }
}

loadBooks();
