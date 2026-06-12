if (auth.isLoggedIn()) {
  auth.redirectToDashboard();
}

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate() {
  let valid = true;
  const errors = {
    fullName: "", email: "", phone: "", password: "", confirmPassword: "", role: ""
  };

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.querySelector('input[name="role"]:checked')?.value;

  if (!fullName || fullName.length < 6) {
    errors.fullName = "Full name must be at least 6 characters.";
    valid = false;
  } else if (!/^[A-Za-z]+(?:\s[A-Za-z]+)+$/.test(fullName)) {
    errors.fullName = "Full name must contain at least two words (letters only).";
    valid = false;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
    valid = false;
  }

  if (!phone || !/^(98|97)\d{8}$/.test(phone)) {
    errors.phone = "Phone must be 10 digits starting with 98 or 97.";
    valid = false;
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
    valid = false;
  } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    errors.password = "Password must contain at least one letter and one number.";
    valid = false;
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
    valid = false;
  }

  if (!role) {
    errors.role = "Please select a role.";
    valid = false;
  }

  // Render errors
  Object.keys(errors).forEach((key) => {
    const el = document.getElementById(`${key}-error`);
    if (el) el.textContent = errors[key];
  });

  return valid;
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

function setLoading(state) {
  const btn = document.getElementById("submit-btn");
  document.getElementById("btn-text").textContent = state ? "Creating Account..." : "Create Account";
  document.getElementById("btn-spinner").classList.toggle("hidden", !state);
  btn.disabled = state;
}

function showError(msg) {
  const el = document.getElementById("error-msg");
  el.textContent = msg;
  el.classList.remove("hidden");
  document.getElementById("success-msg").classList.add("hidden");
}

function showSuccess(msg) {
  const el = document.getElementById("success-msg");
  el.textContent = msg;
  el.classList.remove("hidden");
  document.getElementById("error-msg").classList.add("hidden");
}

// ─── Form Submit ─────────────────────────────────────────────────────────────

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validate()) return;

  const payload = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    phoneNumber: document.getElementById("phone").value.trim(),
    role: document.querySelector('input[name="role"]:checked').value,
  };

  setLoading(true);

  try {
    const res = await authAPI.register(payload);

    if (res.ok) {
      showSuccess("Account created! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/pages/login/login.html";
      }, 1500);
    } else {
      const msg = await res.text();
      showError(msg || "Registration failed. Please try again.");
    }
  } catch {
    showError("Unable to connect. Please check your connection.");
  } finally {
    setLoading(false);
  }
});