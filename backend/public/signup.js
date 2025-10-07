const API_BASE = "https://library-management-system-production-5be5.up.railway.app/api";

const form = document.getElementById("signupForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const msg = document.getElementById("formMessage");
const toggleBtn = document.getElementById("toggleSignupPassword");

toggleBtn.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!name || !email || !password) {
    msg.textContent = "Please fill in all fields.";
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
      msg.textContent = data.message || "Registration failed";
      return;
    }
    msg.textContent = "Registered successfully. Redirecting to login...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (err) {
    msg.textContent = "Network error. Try again.";
  }
});


