auth.requireRole("Owner", "Admin");
renderNavbar("owner-resources");

const ownerId = parseInt(localStorage.getItem("userId"));

// Guard: ensure we have a valid numeric ownerId before doing owner-specific actions
if (isNaN(ownerId) || ownerId <= 0) {
  console.warn("[ownerresource] Invalid ownerId in localStorage:", localStorage.getItem("userId"));
  // show a user-friendly message and redirect to login to re-establish session
  try { showError("Invalid session. Please sign in again."); } catch (e) { /* ignore if showError not yet defined */ }
  // clear any partial session and send user to login
  try { auth.logout(); } catch (e) { /* ignore */ }
  setTimeout(() => {
    window.location.href = "/pages/login/login.html";
  }, 1200);
}
let allResources = [];
let editingId = null;
let deletingId = null;

// ─── Load Resources ───────────────────────────────────────────────────────────

async function loadResources() {
  showLoading();
  try {
    const res = await resourceAPI.getAll();
    if (!res.ok) throw new Error("Failed to fetch resources.");
    const all = await res.json();
    // Filter to only this owner's resources
    allResources = all.filter((r) => r.ownerId === ownerId);
    renderResources(allResources);
  } catch (err) {
    showError(err.message);
  }
}

function renderResources(list) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");

  const grid = document.getElementById("resources-grid");
  const empty = document.getElementById("empty-state");

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
        <p class="resource-desc">${r.description}</p>
        <div class="resource-actions">
          <button class="btn-icon edit" onclick="openEditModal(${r.id})">✏️ Edit</button>
          <button class="btn-icon delete" onclick="openDeleteModal(${r.id}, '${escapeHtml(r.name)}')">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join("");
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function openModal() {
  editingId = null;
  document.getElementById("modal-title").textContent = "Add Resource";
  document.getElementById("save-btn-text").textContent = "Save Resource";
  document.getElementById("edit-id").value = "";
  document.getElementById("res-name").value = "";
  document.getElementById("res-desc").value = "";
  document.getElementById("res-image").value = "";
  clearImage();
  clearFormMessages();
  document.getElementById("resource-modal").classList.remove("hidden");
}

function openEditModal(id) {
  const resource = allResources.find((r) => r.id === id);
  if (!resource) return;

  editingId = id;
  document.getElementById("modal-title").textContent = "Edit Resource";
  document.getElementById("save-btn-text").textContent = "Update Resource";
  document.getElementById("edit-id").value = id;
  document.getElementById("res-name").value = resource.name;
  document.getElementById("res-desc").value = resource.description;
  clearImage();

  if (resource.imageUrl) {
    document.getElementById("image-preview").src = resource.imageUrl;
    document.getElementById("image-preview-wrap").classList.remove("hidden");
  }

  clearFormMessages();
  document.getElementById("resource-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("resource-modal").classList.add("hidden");
  editingId = null;
}

document.getElementById("resource-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("resource-modal")) closeModal();
});

// ─── Image Preview ────────────────────────────────────────────────────────────

document.getElementById("res-image").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById("image-preview").src = ev.target.result;
    document.getElementById("image-preview-wrap").classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

function clearImage() {
  document.getElementById("res-image").value = "";
  document.getElementById("image-preview-wrap").classList.add("hidden");
  document.getElementById("image-preview").src = "";
}

// ─── Form Validation ──────────────────────────────────────────────────────────

function validateForm() {
  let valid = true;
  document.getElementById("name-error").textContent = "";
  document.getElementById("desc-error").textContent = "";

  const name = document.getElementById("res-name").value.trim();
  const desc = document.getElementById("res-desc").value.trim();

  if (!name || name.length < 6) {
    document.getElementById("name-error").textContent = "Name must be at least 6 characters.";
    valid = false;
  }
  if (!desc || desc.length < 10) {
    document.getElementById("desc-error").textContent = "Description must be at least 10 characters.";
    valid = false;
  }
  return valid;
}

// ─── Form Submit ──────────────────────────────────────────────────────────────

document.getElementById("resource-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const formData = new FormData();
  formData.append("name", document.getElementById("res-name").value.trim());
  formData.append("description", document.getElementById("res-desc").value.trim());
  formData.append("ownerId", ownerId);

  const imageFile = document.getElementById("res-image").files[0];
  if (imageFile) formData.append("image", imageFile);

  setSaveLoading(true);
  clearFormMessages();

  try {
    const res = editingId
      ? await resourceAPI.update(editingId, formData)
      : await resourceAPI.create(formData);

    if (res.ok) {
      showFormSuccess(editingId ? "Resource updated successfully!" : "Resource added successfully!");
      setTimeout(() => {
        closeModal();
        loadResources();
      }, 1200);
    } else {
      const msg = await res.text();
      showFormError(msg || "Failed to save resource.");
    }
  } catch {
    showFormError("Connection error. Please try again.");
  } finally {
    setSaveLoading(false);
  }
});

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function openDeleteModal(id, name) {
  deletingId = id;
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
    const res = await resourceAPI.delete(deletingId);
    if (res.ok) {
      closeDeleteModal();
      loadResources();
    } else {
      const msg = await res.text();
      alert(msg || "Failed to delete resource.");
    }
  } catch {
    alert("Connection error. Please try again.");
  } finally {
    setDeleteLoading(false);
  }
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function setSaveLoading(state) {
  document.getElementById("save-btn").disabled = state;
  document.getElementById("save-btn-text").textContent = state
    ? "Saving..."
    : (editingId ? "Update Resource" : "Save Resource");
  document.getElementById("save-spinner").classList.toggle("hidden", !state);
}

function setDeleteLoading(state) {
  document.getElementById("confirm-delete-btn").disabled = state;
  document.getElementById("delete-btn-text").textContent = state ? "Deleting..." : "Delete";
  document.getElementById("delete-spinner").classList.toggle("hidden", !state);
}

function clearFormMessages() {
  document.getElementById("form-error").classList.add("hidden");
  document.getElementById("form-success").classList.add("hidden");
}

function showFormError(msg) {
  const el = document.getElementById("form-error");
  el.textContent = msg;
  el.classList.remove("hidden");
}

function showFormSuccess(msg) {
  const el = document.getElementById("form-success");
  el.textContent = msg;
  el.classList.remove("hidden");
}

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