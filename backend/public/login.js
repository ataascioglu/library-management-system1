const API_BASE = "https://library-management-system-production-5be5.up.railway.app/api";

const form = document.getElementById("accessForm");
const emailInput = document.getElementById("userEmail");
const passwordInput = document.getElementById("userPassword");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  emailError.textContent = "";
  passwordError.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email) {
    emailError.textContent = "Email is required";
  }
  if (!password) {
    passwordError.textContent = "Password is required";
  }
  if (!email || !password) return;

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      passwordError.textContent = data.message || "Login failed";
      return;
    }
    localStorage.setItem("booknest_token", data.token);
    localStorage.setItem("userName", data.user.name);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userRole", data.user.role);
    window.location.href = "books.html";
  } catch (err) {
    passwordError.textContent = "Network error. Try again.";
  }
});


