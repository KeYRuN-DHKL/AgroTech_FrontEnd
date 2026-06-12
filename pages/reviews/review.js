auth.requireRole("Farmer", "Admin");
renderNavbar("reviews");

let selectedRating = 0;

// Pre-fill resourceId from URL params if coming from resources page
const urlParams = new URLSearchParams(window.location.search);
const preResourceId = urlParams.get("resourceId");
const preResourceName = urlParams.get("resourceName");

// ─── Load Reviews ─────────────────────────────────────────────────────────────

async function loadReviews() {
  showLoading();
  try {
    const res = await reviewAPI.getAll();
    if (!res.ok) throw new Error("Failed to load reviews.");
    const reviews = await res.json();
    renderReviews(reviews);
  } catch (err) {
    showError(err.message);
  }
}

function renderReviews(list) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");

  const container = document.getElementById("reviews-list");
  const empty = document.getElementById("empty-state");

  if (!list || list.length === 0) {
    empty.classList.remove("hidden");
    container.classList.add("hidden");
    return;
  }

  empty.classList.add("hidden");
  container.classList.remove("hidden");

  container.innerHTML = list.map((r) => `
    <div class="review-card">
      <div class="review-top">
        <div class="review-meta">
          <div class="review-farmer">👤 ${r.farmerName || "Farmer"}</div>
          <div class="review-resource">📦 ${r.resourceName || `Resource #${r.resourceId}`}</div>
        </div>
        <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      </div>
      ${r.comment ? `<p class="review-comment">"${r.comment}"</p>` : ""}
    </div>
  `).join("");
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function setRating(val) {
  selectedRating = val;
  document.querySelectorAll(".star").forEach((s) => {
    s.classList.toggle("active", parseInt(s.dataset.val) <= val);
  });
  document.getElementById("rating-error").textContent = "";
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function openReviewModal() {
  selectedRating = 0;
  document.querySelectorAll(".star").forEach((s) => s.classList.remove("active"));
  document.getElementById("resource-id").value = preResourceId || "";
  document.getElementById("comment").value = "";
  document.getElementById("char-count").textContent = "0 / 500";
  document.getElementById("review-error").classList.add("hidden");
  document.getElementById("review-success").classList.add("hidden");
  document.getElementById("resource-error").textContent = "";
  document.getElementById("rating-error").textContent = "";
  document.getElementById("review-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("review-modal").classList.add("hidden");
}

document.getElementById("review-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("review-modal")) closeModal();
});

// Character counter
document.getElementById("comment").addEventListener("input", () => {
  const len = document.getElementById("comment").value.length;
  document.getElementById("char-count").textContent = `${len} / 500`;
});

// ─── Submit Review ────────────────────────────────────────────────────────────

document.getElementById("review-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  document.getElementById("resource-error").textContent = "";
  document.getElementById("rating-error").textContent = "";

  const resourceId = parseInt(document.getElementById("resource-id").value);
  const comment = document.getElementById("comment").value.trim();
  const farmerId = parseInt(localStorage.getItem("userId"));

  let valid = true;

  if (!resourceId || resourceId < 1) {
    document.getElementById("resource-error").textContent = "Enter a valid resource ID.";
    valid = false;
  }

  if (!selectedRating) {
    document.getElementById("rating-error").textContent = "Please select a rating.";
    valid = false;
  }

  if (!farmerId) {
    document.getElementById("review-error").textContent = "Session expired. Please log in again.";
    document.getElementById("review-error").classList.remove("hidden");
    return;
  }

  if (!valid) return;

  setLoading(true);

  try {
    const res = await reviewAPI.create({ resourceId, farmerId, rating: selectedRating, comment });

    if (res.ok) {
      document.getElementById("review-success").textContent = "Review submitted successfully!";
      document.getElementById("review-success").classList.remove("hidden");
      setTimeout(() => {
        closeModal();
        loadReviews();
      }, 1500);
    } else {
      const msg = await res.text();
      document.getElementById("review-error").textContent = msg || "Failed to submit review.";
      document.getElementById("review-error").classList.remove("hidden");
    }
  } catch {
    document.getElementById("review-error").textContent = "Connection error. Please try again.";
    document.getElementById("review-error").classList.remove("hidden");
  } finally {
    setLoading(false);
  }
});

function setLoading(state) {
  document.getElementById("review-btn").disabled = state;
  document.getElementById("review-btn-text").textContent = state ? "Submitting..." : "Submit Review";
  document.getElementById("review-spinner").classList.toggle("hidden", !state);
}

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("reviews-list").classList.add("hidden");
  document.getElementById("empty-state").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");
}

function showError(msg) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-text").textContent = msg;
  document.getElementById("error-state").classList.remove("hidden");
}

// Auto-open modal if coming from resources page with resourceId
if (preResourceId) {
  openReviewModal();
}

loadReviews();