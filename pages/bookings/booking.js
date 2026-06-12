auth.requireRole("Farmer", "Admin");
renderNavbar("bookings");

let allBookings = [];
const userId = parseInt(localStorage.getItem("userId"));

const STATUS_MAP = {
  1: { label: "Pending",  cls: "badge-pending",  cardCls: "status-pending"  },
  2: { label: "Approved", cls: "badge-approved", cardCls: "status-approved" },
  3: { label: "Rejected", cls: "badge-rejected", cardCls: "status-rejected" },
};

async function loadBookings() {
  showLoading();
  try {
    const res = await bookingAPI.getAll();
    if (!res.ok) throw new Error("Failed to load bookings.");
    const all = await res.json();
    // Filter to only this farmer's bookings by userName match or userId
    allBookings = all.filter((b) => b.userName === auth.getFullName());
    renderBookings(allBookings);
  } catch (err) {
    showError(err.message);
  }
}

function renderBookings(list) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");

  const container = document.getElementById("bookings-list");
  const empty = document.getElementById("empty-state");

  if (!list || list.length === 0) {
    empty.classList.remove("hidden");
    container.classList.add("hidden");
    return;
  }

  empty.classList.add("hidden");
  container.classList.remove("hidden");

  container.innerHTML = list.map((b) => {
    const status = STATUS_MAP[b.status] || STATUS_MAP[1];
    return `
      <div class="booking-card ${status.cardCls}">
        <div>
          <div class="booking-resource">📦 ${b.resourceName}</div>
          <div class="booking-meta">
            <span>📅 ${formatDate(b.startTime)}</span>
            <span>⏰ ${formatDate(b.endTime)}</span>
            <span>🆔 Booking #${b.id}</span>
          </div>
        </div>
        <div>
          <span class="status-badge ${status.cls}">${status.label}</span>
        </div>
      </div>
    `;
  }).join("");
}

function filterBookings() {
  const val = document.getElementById("status-filter").value;
  if (!val) {
    renderBookings(allBookings);
    return;
  }
  renderBookings(allBookings.filter((b) => String(b.status) === val));
}

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

loadBookings();