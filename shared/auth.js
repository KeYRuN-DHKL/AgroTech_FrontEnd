// ─── Auth Helpers ────────────────────────────────────────────────────────────

const auth = {
  // Save login response to localStorage
  saveSession(data) {
    console.log("[Auth.saveSession] Login response data:", data);
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("role", data.role);
    localStorage.setItem("fullName", data.fullName);

    const userId = data.userId ?? data.id ?? (data.user ? data.user.id ?? data.user.userId : null);
    console.log("[Auth.saveSession] Extracted userId:", userId, "from fields: userId=%s, id=%s, user.id=%s, user.userId=%s", data.userId, data.id, data.user?.id, data.user?.userId);
    if (userId !== null && userId !== undefined) {
      localStorage.setItem("userId", String(userId));
      console.log("[Auth.saveSession] Stored userId in localStorage:", localStorage.getItem("userId"));
    } else {
      console.warn("[Auth.saveSession] Failed to extract userId - backend response missing expected fields!");
    }
  },

  // Clear session
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    localStorage.removeItem("userId");
  },

  // Get current role
  getRole() {
    return localStorage.getItem("role");
  },

  // Get full name
  getFullName() {
    return localStorage.getItem("fullName");
  },

  // Get user id
  getUserId() {
    return localStorage.getItem("userId");
  },

  // Get token
  getToken() {
    return localStorage.getItem("token");
  },

  // Check if logged in
  isLoggedIn() {
    return !!localStorage.getItem("token");
  },

  // Redirect to correct dashboard based on role
  redirectToDashboard() {
    const role = this.getRole();
    if (role === "Admin") {
      window.location.href = "/pages/admin-dashboard/dashboard.html";
    } else if (role === "Owner") {
      window.location.href = "/pages/owner-resources/ownerresource.html";
    } else if (role === "Farmer") {
      window.location.href = "/pages/resources/resource.html";
    } else {
      window.location.href = "/pages/login/login.html";
    }
  },

  // Guard: redirect to login if not logged in
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = "/pages/login/login.html";
    }
  },

  // Guard: redirect if role doesn't match
  requireRole(...roles) {
    this.requireLogin();
    const role = this.getRole();
    if (!roles.includes(role)) {
      this.redirectToDashboard();
    }
  },
};