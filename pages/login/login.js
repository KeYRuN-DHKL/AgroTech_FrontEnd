// Redirect if already logged in
if (auth.isLoggedIn()) {
  auth.redirectToDashboard();
}

// ─── Toggle Password Visibility ──────────────────────────────────────────────

function togglePassword() {
  const pw = document.getElementById("password");
  pw.type = pw.type === "password" ? "text" : "password";
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate() {
  let valid = true;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  document.getElementById("email-error").textContent = "";
  document.getElementById("password-error").textContent = "";

  if (!email) {
    document.getElementById("email-error").textContent = "Email is required.";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("email-error").textContent = "Enter a valid email address.";
    valid = false;
  }

  if (!password) {
    document.getElementById("password-error").textContent = "Password is required.";
    valid = false;
  } else if (password.length < 6) {
    document.getElementById("password-error").textContent = "Password must be at least 6 characters.";
    valid = false;
  }

  return valid;
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

function setLoading(state) {
  const btn = document.getElementById("submit-btn");
  const text = document.getElementById("btn-text");
  const spinner = document.getElementById("btn-spinner");
  btn.disabled = state;
  text.textContent = state ? "Signing in..." : "Sign In";
  spinner.classList.toggle("hidden", !state);
}

function showError(msg) {
  const el = document.getElementById("error-msg");
  el.textContent = msg;
  el.classList.remove("hidden");
}

function hideError() {
  document.getElementById("error-msg").classList.add("hidden");
}

// ─── Form Submit ─────────────────────────────────────────────────────────────

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  if (!validate()) return;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  setLoading(true);

  try {
    const res = await authAPI.login({ email, password });

    if (res.ok) {
      const data = await res.json();
      auth.saveSession(data);
      auth.redirectToDashboard();
    } else {
      const msg = await res.text();
      showError(msg || "Invalid email or password.");
    }
  } catch (err) {
    showError("Unable to connect. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
});