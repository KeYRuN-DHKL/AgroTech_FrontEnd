// ─── Base Config ─────────────────────────────────────────────────────────────

const BASE_URL = "https://localhost:7144/api"; 

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function authHeadersForm() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

const authAPI = {
  login: (dto) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }),

  register: (dto) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }),

  refreshToken: (dto) =>
    fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }),
};

// ─── User API ─────────────────────────────────────────────────────────────────

const userAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/user`, { headers: authHeaders() }),

  getById: (id) =>
    fetch(`${BASE_URL}/user/${id}`, { headers: authHeaders() }),

  searchByName: (name) =>
    fetch(`${BASE_URL}/user/search?name=${encodeURIComponent(name)}`, {
      headers: authHeaders(),
    }),

  create: (dto) =>
    fetch(`${BASE_URL}/user`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }),

  update: (id, dto) =>
    fetch(`${BASE_URL}/user/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }),

  resetPassword: (email, password) =>
    fetch(
      `${BASE_URL}/user/Reset-Password?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      { method: "PUT", headers: authHeaders() }
    ),

  delete: (id) =>
    fetch(`${BASE_URL}/user/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),
};

// ─── Resource API ─────────────────────────────────────────────────────────────

const resourceAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/resource`, { headers: authHeadersForm() }),

  getById: (id) =>
    fetch(`${BASE_URL}/resource/${id}`, { headers: authHeadersForm() }),

  create: (formData) =>
    fetch(`${BASE_URL}/resource`, {
      method: "POST",
      headers: authHeadersForm(),
      body: formData,
    }),

  update: (id, formData) =>
    fetch(`${BASE_URL}/resource/${id}`, {
      method: "PUT",
      headers: authHeadersForm(),
      body: formData,
    }),

  delete: (id) =>
    fetch(`${BASE_URL}/resource/${id}`, {
      method: "DELETE",
      headers: authHeadersForm(),
    }),
};

// ─── Booking API ──────────────────────────────────────────────────────────────

const bookingAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/booking`, { headers: authHeaders() }),

  getById: (id) =>
    fetch(`${BASE_URL}/booking/${id}`, { headers: authHeaders() }),

  create: (dto) =>
    fetch(`${BASE_URL}/booking`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }),

  delete: (id) =>
    fetch(`${BASE_URL}/booking/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  getPending: () =>
    fetch(`${BASE_URL}/booking/pending`, { headers: authHeaders() }),

  updateStatus: (dto) =>
    fetch(`${BASE_URL}/booking/update-status`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }),

  getAdminDashboard: () =>
    fetch(`${BASE_URL}/booking/admin-dashboard`, { headers: authHeaders() }),

  deleteFromDashboard: (id) =>
    fetch(`${BASE_URL}/booking/admin-dashboard/delete/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),
};

// ─── Review API ───────────────────────────────────────────────────────────────

const reviewAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/review`, { headers: authHeaders() }),

  getById: (id) =>
    fetch(`${BASE_URL}/review/${id}`, { headers: authHeaders() }),

  create: (dto) =>
    fetch(`${BASE_URL}/review`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────

const dashboardAPI = {
  getStats: () =>
    fetch(`${BASE_URL}/dashboard/stats`, { headers: authHeaders() }),
};