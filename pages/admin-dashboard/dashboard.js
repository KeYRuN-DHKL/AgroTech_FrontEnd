auth.requireRole("Admin");
renderNavbar("admin-dashboard");

const CHART_DEFAULTS = {
  color: "#94a3b8",
  grid: "#1e293b",
  border: "#334155",
};

let chartInstances = {};

// ─── Load Dashboard ───────────────────────────────────────────────────────────

async function loadDashboard() {
  showLoading();
  try {
    const res = await dashboardAPI.getStats();
    if (!res.ok) throw new Error("Failed to load dashboard stats.");
    const data = await res.json();
    renderStats(data);
    renderCharts(data);
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("dashboard-content").classList.remove("hidden");
  } catch (err) {
    showError(err.message);
  }
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────

function renderStats(data) {
  document.getElementById("stat-users").textContent     = data.totalUsers     ?? 0;
  document.getElementById("stat-farmers").textContent   = data.totalFarmers   ?? 0;
  document.getElementById("stat-owners").textContent    = data.totalOwners    ?? 0;
  document.getElementById("stat-resources").textContent = data.totalResources ?? 0;
  document.getElementById("stat-bookings").textContent  = data.totalBookings  ?? 0;
  document.getElementById("stat-pending").textContent   = data.pendingBookings  ?? 0;
  document.getElementById("stat-approved").textContent  = data.approvedBookings ?? 0;
  document.getElementById("stat-rejected").textContent  = data.rejectedBookings ?? 0;
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function renderCharts(data) {
  // Destroy existing charts before re-rendering
  Object.values(chartInstances).forEach((c) => c.destroy());
  chartInstances = {};

  chartInstances.users = buildLineChart(
    "chart-users",
    data.userGrowth || [],
    "#38bdf8",
    "Users"
  );

  chartInstances.bookings = buildBarChart(
    "chart-bookings",
    data.bookingGrowth || [],
    "#818cf8",
    "Bookings"
  );

  chartInstances.resources = buildBarChart(
    "chart-resources",
    data.resourceGrowth || [],
    "#34d399",
    "Resources"
  );

  chartInstances.status = buildDoughnutChart("chart-status", {
    pending:  data.pendingBookings  ?? 0,
    approved: data.approvedBookings ?? 0,
    rejected: data.rejectedBookings ?? 0,
  });
}

function buildLineChart(id, trendData, color, label) {
  const ctx = document.getElementById(id).getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: trendData.map((d) => d.month),
      datasets: [{
        label,
        data: trendData.map((d) => d.count),
        borderColor: color,
        backgroundColor: color + "22",
        borderWidth: 2,
        pointBackgroundColor: color,
        pointRadius: 4,
        fill: true,
        tension: 0.4,
      }],
    },
    options: chartOptions(label),
  });
}

function buildBarChart(id, trendData, color, label) {
  const ctx = document.getElementById(id).getContext("2d");
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: trendData.map((d) => d.month),
      datasets: [{
        label,
        data: trendData.map((d) => d.count),
        backgroundColor: color + "99",
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: chartOptions(label),
  });
}

function buildDoughnutChart(id, { pending, approved, rejected }) {
  const ctx = document.getElementById(id).getContext("2d");
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Pending", "Approved", "Rejected"],
      datasets: [{
        data: [pending, approved, rejected],
        backgroundColor: ["#f59e0b99", "#22c55e99", "#ef444499"],
        borderColor: ["#f59e0b", "#22c55e", "#ef4444"],
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: CHART_DEFAULTS.color, font: { size: 12 }, padding: 16 },
        },
      },
      cutout: "65%",
    },
  });
}

function chartOptions(label) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        borderWidth: 1,
        titleColor: "#f1f5f9",
        bodyColor: "#94a3b8",
      },
    },
    scales: {
      x: {
        ticks: { color: CHART_DEFAULTS.color, font: { size: 11 } },
        grid: { color: CHART_DEFAULTS.grid },
        border: { color: CHART_DEFAULTS.border },
      },
      y: {
        beginAtZero: true,
        ticks: { color: CHART_DEFAULTS.color, font: { size: 11 }, precision: 0 },
        grid: { color: CHART_DEFAULTS.grid },
        border: { color: CHART_DEFAULTS.border },
      },
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("dashboard-content").classList.add("hidden");
  document.getElementById("error-state").classList.add("hidden");
}

function showError(msg) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("error-text").textContent = msg;
  document.getElementById("error-state").classList.remove("hidden");
}

// ─── Init ─────────────────────────────────────────────────────────────────────

loadDashboard();