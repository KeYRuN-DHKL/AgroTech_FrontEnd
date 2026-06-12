auth.requireRole("Admin");
renderNavbar("admin-bookings");

let allBookings = [];
let deletingId = null;

// ─── Load Bookings ────────────────────────────────────────────────────────────

async function loadBookings() {
  showLoading();
  try {
    const res = await bookingAPI.getAdminDashboard();
    if (!res.ok) throw new Error("Failed to load bookings.");
    allBookings = await res.json();
    renderBookings(allBookings);
  } catch (err) {
    showError(err.message);
  }
}

function renderBookings(list) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");

  const tbody = document.getElementById("bookings-tbody");
  const tableWrap = document.getElementById("table-wrap");
  const empty = document.getElementById("empty-state");

  if (!list || list.length === 0) {
    empty.classList.remove("hidden");
    tableWrap.classList.add("hidden");
    return;
  }

  empty.classList.add("hidden");
  tableWrap.classList.remove("hidden");

  tbody.innerHTML = list.map((b) => `
    <tr id="booking-row-${b.bookingId}">
      <td class="booking-id">#${b.bookingId}</td>
      <td class="cell-name">${b.ownerName || "—"}</td>
      <td class="cell-name">${b.resourceName || "—"}</td>
      <td class="cell-sub">${b.farmerName || "—"}</td>
      <td class="cell-sub">${formatDate(b.startTime)}</td>
      <td class="cell-sub">${formatDate(b.endTime)}</td>
      <td>
        <button class="btn-delete-sm" onclick="openDeleteModal(${b.bookingId})">
          🗑️ Delete
        </button>
      </td>
    </tr>
  `).join("");
}

// ─── Search / Filter ──────────────────────────────────────────────────────────

function filterBookings() {
  const query = document.getElementById("search-input").value.toLowerCase().trim();
  if (!query) {
    renderBookings(allBookings);
    return;
  }
  const filtered = allBookings.filter(
    (b) =>
      (b.farmerName  || "").toLowerCase().includes(query) ||
      (b.resourceName|| "").toLowerCase().includes(query) ||
      (b.ownerName   || "").toLowerCase().includes(query)
  );
  renderBookings(filtered);
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function openDeleteModal(id) {
  deletingId = id;
  document.getElementById("delete-label").textContent = `#${id}`;
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
    const res = await bookingAPI.deleteFromDashboard(deletingId);
    if (res.ok) {
      closeDeleteModal();
      allBookings = allBookings.filter((b) => b.bookingId !== deletingId);
      filterBookings();
      showToast("Booking deleted successfully.", "success");
    } else {
      const msg = await res.text();
      showToast(msg || "Failed to delete booking.", "error");
    }
  } catch {
    showToast("Connection error. Please try again.", "error");
  } finally {
    setDeleteLoading(false);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

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

// ─── Init ─────────────────────────────────────────────────────────────────────

loadBookings();