auth.requireRole("Owner", "Admin");
renderNavbar("owner-bookings");

// ─── Load Pending Bookings ────────────────────────────────────────────────────

async function loadPendingBookings() {
  showLoading();
  try {
    const res = await bookingAPI.getPending();
    if (!res.ok) throw new Error("Failed to load pending bookings.");
    const bookings = await res.json();
    renderBookings(bookings);
  } catch (err) {
    showError(err.message);
  }
}

function renderBookings(list) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");

  const container = document.getElementById("bookings-list");
  const empty = document.getElementById("empty-state");
  const badge = document.getElementById("pending-count-badge");

  if (!list || list.length === 0) {
    empty.classList.remove("hidden");
    container.classList.add("hidden");
    badge.classList.add("hidden");
    return;
  }

  badge.textContent = `${list.length} pending`;
  badge.classList.remove("hidden");

  empty.classList.add("hidden");
  container.classList.remove("hidden");

  container.innerHTML = list.map((b) => `
    <div class="booking-card" id="booking-${b.bookingId}">
      <div>
        <div class="booking-farmer">👤 ${b.farmerName || "Farmer"}</div>
        <div class="booking-meta">
          <span>🆔 Booking #${b.bookingId}</span>
          <span>📅 ${formatDate(b.startTime)}</span>
          <span>⏰ Until ${formatDate(b.endTime)}</span>
        </div>
      </div>
      <div class="booking-actions">
        <button class="btn-approve" onclick="updateStatus(${b.bookingId}, 2, this)">
          ✅ Approve
        </button>
        <button class="btn-reject" onclick="updateStatus(${b.bookingId}, 3, this)">
          ✕ Reject
        </button>
      </div>
    </div>
  `).join("");
}

// ─── Update Booking Status ────────────────────────────────────────────────────

async function updateStatus(bookingId, newStatus, btn) {
  const card = document.getElementById(`booking-${bookingId}`);
  const buttons = card.querySelectorAll("button");
  buttons.forEach((b) => (b.disabled = true));

  try {
    const res = await bookingAPI.updateStatus({ bookingId, newStatus });

    if (res.ok) {
      showToast(newStatus === 2 ? "Booking approved!" : "Booking rejected.", newStatus === 2 ? "success" : "error");
      // Fade out and remove the card
      card.style.transition = "opacity 0.4s";
      card.style.opacity = "0";
      setTimeout(() => {
        card.remove();
        // Update or hide the badge
        const remaining = document.querySelectorAll(".booking-card").length;
        const badge = document.getElementById("pending-count-badge");
        if (remaining === 0) {
          badge.classList.add("hidden");
          document.getElementById("empty-state").classList.remove("hidden");
          document.getElementById("bookings-list").classList.add("hidden");
        } else {
          badge.textContent = `${remaining} pending`;
        }
      }, 400);
    } else {
      const msg = await res.text();
      showToast(msg || "Failed to update status.", "error");
      buttons.forEach((b) => (b.disabled = false));
    }
  } catch {
    showToast("Connection error. Please try again.", "error");
    buttons.forEach((b) => (b.disabled = false));
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

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("bookings-list").classList.add("hidden");
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

loadPendingBookings();