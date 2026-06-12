// ─── Navbar Renderer ─────────────────────────────────────────────────────────

function renderNavbar(activePage = "") {
  const role = auth.getRole();
  const fullName = auth.getFullName();

  const farmerLinks = `
    <a href="/pages/resources/resource.html" class="${activePage === "resources" ? "active" : ""}">Browse Resources</a>
    <a href="/pages/bookings/booking.html" class="${activePage === "bookings" ? "active" : ""}">My Bookings</a>
    <a href="/pages/reviews/review.html" class="${activePage === "reviews" ? "active" : ""}">Reviews</a>
  `;

  const ownerLinks = `
    <a href="/pages/owner-resources/ownerresource.html" class="${activePage === "owner-resources" ? "active" : ""}">My Resources</a>
    <a href="/pages/owner-bookings/ownerbooking.html" class="${activePage === "owner-bookings" ? "active" : ""}">Pending Bookings</a>
  `;

  const adminLinks = `
    <a href="/pages/admin-dashboard/dashboard.html" class="${activePage === "admin-dashboard" ? "active" : ""}">Dashboard</a>
    <a href="/pages/admin-users/adminuser.html" class="${activePage === "admin-users" ? "active" : ""}">Users</a>
    <a href="/pages/admin-bookings/adminbooking.html" class="${activePage === "admin-bookings" ? "active" : ""}">Bookings</a>  `;

  let links = "";
  if (role === "Farmer") links = farmerLinks;
  else if (role === "Owner") links = ownerLinks;
  else if (role === "Admin") links = adminLinks;

  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  navbar.innerHTML = `
    <div class="nav-brand">
      <span class="nav-logo">🌾</span>
      <span class="nav-title">AgroTech</span>
    </div>
    <nav class="nav-links">
      ${links}
    </nav>
    <div class="nav-user">
      <span class="nav-name">${fullName || "User"}</span>
      <span class="nav-role-badge">${role || ""}</span>
      <button class="nav-logout" onclick="handleLogout()">Logout</button>
    </div>
    <button class="nav-hamburger" onclick="toggleMobileMenu()">☰</button>
  `;
}

function handleLogout() {
  auth.logout();
  window.location.href = "/pages/login/login.html";
}

function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  navLinks.classList.toggle("open");
}