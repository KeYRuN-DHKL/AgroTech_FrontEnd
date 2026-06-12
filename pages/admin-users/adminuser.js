auth.requireRole("Admin");
renderNavbar("admin-users");

let allUsers = [];
let deletingId = null;
let deletingName = "";

// ─── Load Users ───────────────────────────────────────────────────────────────

async function loadUsers() {
  showLoading();
  try {
    const res = await userAPI.getAll();
    if (!res.ok) throw new Error("Failed to load users.");
    allUsers = await res.json();
    renderUsers(allUsers);
  } catch (err) {
    showError(err.message);
  }
}

function renderUsers(list) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");

  const tbody = document.getElementById("users-tbody");
  const tableWrap = document.getElementById("table-wrap");
  const empty = document.getElementById("empty-state");

  if (!list || list.length === 0) {
    empty.classList.remove("hidden");
    tableWrap.classList.add("hidden");
    return;
  }

  empty.classList.add("hidden");
  tableWrap.classList.remove("hidden");

  tbody.innerHTML = list.map((u, i) => `
    <tr>
      <td class="user-id">#${u.id}</td>
      <td class="user-name">${u.fullName}</td>
      <td class="user-email">${u.email}</td>
      <td class="user-phone">${u.phoneNumber}</td>
      <td>
        <span class="role-badge role-${u.role.toLowerCase()}">${u.role}</span>
      </td>
      <td>
        <button class="btn-delete-sm" onclick="openDeleteModal(${u.id}, '${escapeHtml(u.fullName)}')">
          🗑️ Delete
        </button>
      </td>
    </tr>
  `).join("");
}

// ─── Search & Filter ──────────────────────────────────────────────────────────

function filterUsers() {
  const query = document.getElementById("search-input").value.toLowerCase().trim();
  const role  = document.getElementById("role-filter").value;

  let filtered = allUsers;
  if (query) {
    filtered = filtered.filter((u) => u.fullName.toLowerCase().includes(query));
  }
  if (role) {
    filtered = filtered.filter((u) => u.role === role);
  }
  renderUsers(filtered);
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function openDeleteModal(id, name) {
  deletingId = id;
  deletingName = name;
  document.getElementById("delete-name").textContent = name;
  document.getElementById("delete-modal").classList.remove("hidden");
}

function closeDeleteModal() {
  document.getElementById("delete-modal").classList.add("hidden");
  deletingId = null;
}

document.getElementById("delete-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("delete-modal")) closeDeleteModal();
});

async function confirmDelete() {
  if (!deletingId) return;
  setDeleteLoading(true);
  try {
    const res = await userAPI.delete(deletingId);
    if (res.ok) {
      closeDeleteModal();
      allUsers = allUsers.filter((u) => u.id !== deletingId);
      filterUsers();
      showToast(`${deletingName} deleted successfully.`, "success");
    } else {
      const msg = await res.text();
      showToast(msg || "Failed to delete user.", "error");
    }
  } catch {
    showToast("Connection error. Please try again.", "error");
  } finally {
    setDeleteLoading(false);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setDeleteLoading(state) {
  document.getElementById("confirm-delete-btn").disabled = state;
  document.getElementById("delete-btn-text").textContent = state ? "Deleting..." : "Delete";
  document.getElementById("delete-spinner").classList.toggle("hidden", !state);
}

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("table-wrap").classList.add("hidden");
  document.getElementById("empty-state").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");
}

function showError(msg) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-text").textContent = msg;
  document.getElementById("error-state").classList.remove("hidden");
}

function showToast(msg, type = "success") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// ─── Init ─────────────────────────────────────────────────────────────────────

loadUsers();