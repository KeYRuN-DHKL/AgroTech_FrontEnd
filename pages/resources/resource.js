auth.requireRole("Farmer", "Admin","Owner");
renderNavbar("resources");

let allResources = [];
let selectedResourceId = null;

// ─── Load Resources ───────────────────────────────────────────────────────────

async function loadResources() {
  showLoading();
  try {
    const res = await resourceAPI.getAll();
    if (!res.ok) throw new Error("Failed to fetch resources.");
    allResources = await res.json();
    renderResources(allResources);
  } catch (err) {
    showError(err.message);
  }
}

function renderResources(list) {
  const grid = document.getElementById("resources-grid");
  const empty = document.getElementById("empty-state");

  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");

  if (!list || list.length === 0) {
    empty.classList.remove("hidden");
    grid.classList.add("hidden");
    return;
  }

  empty.classList.add("hidden");
  grid.classList.remove("hidden");

  grid.innerHTML = list.map((r) => `
    <div class="resource-card">
      ${r.imageUrl
        ? `<img class="resource-img" src="${r.imageUrl}" alt="${r.name}" onerror="this.style.display='none'" />`
        : `<div class="resource-img-placeholder">🚜</div>`
      }
      <div class="resource-body">
        <h3 class="resource-name">${r.name}</h3>
        <p class="resource-owner">👤 Owner: ${r.ownerName}</p>
        <p class="resource-desc">${r.description}</p>
        <div class="resource-footer">
          <button class="btn-primary" onclick="openBookingModal(${r.id}, '${escapeHtml(r.name)}')">
            📅 Book Now
          </button>
          <a href="/pages/reviews/review.html?resourceId=${r.id}&resourceName=${encodeURIComponent(r.name)}"
             class="btn-secondary">⭐ Reviews</a>
        </div>
      </div>
    </div>
  `).join("");
}

// ─── Search / Filter ──────────────────────────────────────────────────────────

function filterResources() {
  const query = document.getElementById("search-input").value.toLowerCase().trim();
  if (!query) {
    renderResources(allResources);
    return;
  }
  const filtered = allResources.filter(
    (r) =>
      r.name.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.ownerName.toLowerCase().includes(query)
  );
  renderResources(filtered);
}

// ─── Booking Modal ────────────────────────────────────────────────────────────

function openBookingModal(resourceId, resourceName) {
  selectedResourceId = resourceId;
  document.getElementById("modal-resource-name").textContent = `📦 ${resourceName}`;
  document.getElementById("booking-error").classList.add("hidden");
  document.getElementById("booking-success").classList.add("hidden");
  document.getElementById("start-error").textContent = "";
  document.getElementById("end-error").textContent = "";
  document.getElementById("start-time").value = "";
  document.getElementById("end-time").value = "";

  // Set min datetime to now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minVal = now.toISOString().slice(0, 16);
  document.getElementById("start-time").min = minVal;
  document.getElementById("end-time").min = minVal;

  document.getElementById("booking-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("booking-modal").classList.add("hidden");
  selectedResourceId = null;
}

// Close modal on overlay click
document.getElementById("booking-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("booking-modal")) closeModal();
});

// ─── Booking Submit ───────────────────────────────────────────────────────────

document.getElementById("booking-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const startVal = document.getElementById("start-time").value;
  const endVal = document.getElementById("end-time").value;

  document.getElementById("start-error").textContent = "";
  document.getElementById("end-error").textContent = "";

  let valid = true;
  if (!startVal) {
    document.getElementById("start-error").textContent = "Start time is required.";
    valid = false;
  }
  if (!endVal) {
    document.getElementById("end-error").textContent = "End time is required.";
    valid = false;
  }
  if (startVal && endVal && new Date(endVal) <= new Date(startVal)) {
    document.getElementById("end-error").textContent = "End time must be after start time.";
    valid = false;
  }
  if (!valid) return;

  // Get userId from localStorage
  const userId = localStorage.getItem("userId");
  if (!userId) {
    document.getElementById("booking-error").textContent = "User session expired. Please login again.";
    document.getElementById("booking-error").classList.remove("hidden");
    return;
  }

  setBookingLoading(true);

  try {
    const res = await bookingAPI.create({
      resourceId: selectedResourceId,
      userId: parseInt(userId),
      startTime: new Date(startVal).toISOString(),
      endTime: new Date(endVal).toISOString(),
    });

    if (res.ok) {
      document.getElementById("booking-success").textContent = "Booking created! Awaiting owner approval.";
      document.getElementById("booking-success").classList.remove("hidden");
      setTimeout(() => closeModal(), 2000);
    } else {
      const msg = await res.text();
      document.getElementById("booking-error").textContent = msg || "Booking failed.";
      document.getElementById("booking-error").classList.remove("hidden");
    }
  } catch {
    document.getElementById("booking-error").textContent = "Connection error. Please try again.";
    document.getElementById("booking-error").classList.remove("hidden");
  } finally {
    setBookingLoading(false);
  }
});

function setBookingLoading(state) {
  document.getElementById("book-btn").disabled = state;
  document.getElementById("book-btn-text").textContent = state ? "Booking..." : "Confirm Booking";
  document.getElementById("book-spinner").classList.toggle("hidden", !state);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("resources-grid").classList.add("hidden");
  document.getElementById("empty-state").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");
}

function showError(msg) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-text").textContent = msg;
  document.getElementById("error-state").classList.remove("hidden");
}

function escapeHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// ─── Init ─────────────────────────────────────────────────────────────────────

loadResources();