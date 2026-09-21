import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Import Recharts components for the financial overview chart.
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Import the shared Axios API instance.
import api from "../../api/api";

// Import dashboard-specific styles.
import "./dashboard.css";

function Dashboard() {
  // React Router navigation helper.
  const navigate = useNavigate();

  // Store dashboard information returned by the backend.
  const [dashboardData, setDashboardData] = useState(null);

  // Store loading state while dashboard data is being fetched.
  const [loading, setLoading] = useState(true);

  // Store any API error message.
  const [error, setError] = useState("");

  // Get the logged-in user's information from localStorage.
  const storedUser = localStorage.getItem("user");

  // Parse the stored user safely.
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    // If stored user data is invalid, use an empty user object.
    user = null;
  }

  // Fetch dashboard information when the page loads.
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get the authentication token saved after login.
        const token = localStorage.getItem("token");

        // If there is no token, send the user back to login.
        if (!token) {
          navigate("/login");
          return;
        }

        // Request dashboard data from the backend.
        const response = await api.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Store only the dashboard object returned by the API.
        setDashboardData(response.data.dashboard);
      } catch (err) {
        // If the token is invalid or expired, clear login information.
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        // Display a user-friendly error message.
        setError(
          err.response?.data?.message ||
            "Unable to load dashboard information."
        );
      } finally {
        // Stop displaying the loading state.
        setLoading(false);
      }
    };

    // Start loading dashboard information.
    fetchDashboardData();
  }, [navigate]);

  // Handle user logout.
  const handleLogout = () => {
    // Remove authentication information from localStorage.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect the user to the login page.
    navigate("/login");
  };

  // Format numbers as Indian currency.
  const formatCurrency = (value) => {
    return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
  };

  // Create chart data from the actual backend dashboard values.
  const financialChartData = [
    {
      name: "Revenue",
      amount: Number(dashboardData?.totalRevenue ?? 0),
    },
    {
      name: "Cost",
      amount: Number(dashboardData?.totalCost ?? 0),
    },
    {
      name: "Expenses",
      amount: Number(dashboardData?.totalExpenses ?? 0),
    },
  ];

  // Custom tooltip used by the financial chart.
  const CustomTooltip = ({ active, payload, label }) => {
    // Only display the tooltip when chart data is available.
    if (!active || !payload || !payload.length) {
      return null;
    }

    // Get the value represented by the hovered bar.
    const amount = payload[0]?.value ?? 0;

    return (
      <div className="financial-custom-tooltip">
        {/* Display the financial category. */}
        <p className="financial-tooltip-label">{label}</p>

        {/* Display the formatted financial value. */}
        <p className="financial-tooltip-value">
          {formatCurrency(amount)}
        </p>

        {/* Display a small contextual label. */}
        <span className="financial-tooltip-caption">
          Total amount
        </span>
      </div>
    );
  };

  // Show loading screen while the API request is running.
  if (loading) {
    return (
      <div className="dashboard-loading">
        {/* Loading icon. */}
        <i className="fa-solid fa-spinner fa-spin"></i>

        {/* Loading message. */}
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Show an error screen if dashboard loading failed.
  if (error) {
    return (
      <div className="dashboard-error">
        {/* Error icon. */}
        <i className="fa-solid fa-circle-exclamation"></i>

        {/* Error heading. */}
        <h2>Unable to load dashboard</h2>

        {/* Error description. */}
        <p>{error}</p>

        {/* Reload the current page. */}
        <button
          type="button"
          className="dashboard-retry-btn"
          onClick={() => window.location.reload()}
        >
          <i className="fa-solid fa-rotate-right"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="dashboard-sidebar">
        {/* LedgerFlow brand. */}
        <Link to="/dashboard" className="dashboard-brand">
          {/* Brand icon. */}
          <div className="dashboard-brand-icon">
            <i className="fa-solid fa-layer-group"></i>
          </div>

          {/* Brand name. */}
          <span>LedgerFlow</span>
        </Link>

        {/* Main dashboard navigation. */}
        <nav className="dashboard-navigation">

  {/* Dashboard */}
  <Link
    to="/dashboard"
    className="dashboard-nav-item active"
  >
    <i className="fa-solid fa-chart-pie"></i>
    <span>Dashboard</span>
  </Link>

  {/* Products */}
  <Link
    to="/products"
    className="dashboard-nav-item"
  >
    <i className="fa-solid fa-box"></i>
    <span>Products</span>
  </Link>

  {/* Sales */}
  <Link
    to="/sales"
    className="dashboard-nav-item"
  >
    <i className="fa-solid fa-cart-shopping"></i>
    <span>Sales</span>
  </Link>

  {/* Purchases */}
  <Link
    to="/purchases"
    className="dashboard-nav-item"
  >
    <i className="fa-solid fa-truck"></i>
    <span>Purchases</span>
  </Link>

  {/* Customers */}
  <Link
    to="/customers"
    className="dashboard-nav-item"
  >
    <i className="fa-solid fa-users"></i>
    <span>Customers</span>
  </Link>

  {/* Suppliers */}
  <Link to="/suppliers" className="dashboard-nav-item">
  <i className="fa-solid fa-boxes-stacked"></i>
  <span>Suppliers</span>
</Link>

  {/* Invoices */}
  <Link
  to="/invoices"
  className="dashboard-nav-item"
>
  <i className="fa-solid fa-file-invoice"></i>
  <span>Invoices</span>
</Link>

  {/* Expenses */}
  <Link 
  to="/expenses" 
  className="dashboard-nav-item" 
> 
  <i className="fa-solid fa-wallet"></i> 
  <span>Expenses</span> 
</Link>

  {/* Reports */}
  <Link 
  to="/reports" 
  className="dashboard-nav-item" 
>
  <i className="fa-solid fa-chart-column"></i> 
  <span>Reports</span> 
</Link>

  {/* Settings */}
  <Link 
  to="/settings" 
  className="dashboard-nav-item"
>
  <i className="fa-solid fa-gear"></i> 
  <span>Settings</span>
</Link>

</nav>

        {/* Sidebar bottom section. */}
        <div className="dashboard-sidebar-bottom">
          {/* Logout button. */}
          <button
            type="button"
            className="dashboard-nav-item logout-item"
            onClick={handleLogout}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN DASHBOARD
          ===================================================== */}

      <main className="dashboard-main">
        {/* ===================================================
            TOP HEADER
            =================================================== */}

        <header className="dashboard-header">
          {/* Header greeting section. */}
          <div className="dashboard-header-left">
            {/* Small page label. */}
            <p className="dashboard-page-label">
              Business overview
            </p>

            {/* Personalized greeting. */}
            <h1>
              Welcome back,{" "}
              <span>
                {user?.fullName || user?.name || "Business Owner"}
              </span>
            </h1>

            {/* Header description. */}
            <p className="dashboard-header-description">
              Here is what is happening with your business today.
            </p>
          </div>

          {/* Header action section. */}
          <div className="dashboard-header-actions">
            {/* Notification button. */}
            <button
              type="button"
              className="dashboard-icon-button"
              aria-label="Notifications"
            >
              <i className="fa-regular fa-bell"></i>
            </button>

            {/* Logged-in user information. */}
            <div className="dashboard-user">
              {/* User avatar. */}
              <div className="dashboard-user-avatar">
                {(
                  user?.fullName ||
                  user?.name ||
                  "BO"
                )
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              {/* User details. */}
              <div className="dashboard-user-info">
                {/* User name. */}
                <strong>
                  {user?.fullName || user?.name || "Business Owner"}
                </strong>

                {/* Business name. */}
                <span>
                  {user?.businessName || "LedgerFlow Business"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            DASHBOARD CONTENT
            =================================================== */}

        <section className="dashboard-content">
          {/* Business overview heading. */}
          <div className="dashboard-top-row">
            {/* Heading information. */}
            <div>
              <h2>Business Overview</h2>
              <p>
                Monitor your sales, finances and inventory performance.
              </p>
            </div>

            {/* Current date display. */}
            <div className="dashboard-date">
              <i className="fa-regular fa-calendar"></i>
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* =================================================
              STATISTICS
              ================================================= */}

          <div className="dashboard-stat-grid">
            {/* Total sales card. */}
            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <i className="fa-solid fa-cart-shopping"></i>
                </div>
              </div>

              <p className="stat-label">Total Sales</p>

              <h3>
                {dashboardData?.totalSales ?? 0}
              </h3>

              <p className="stat-description">
                Recorded sales transactions
              </p>
            </div>

            {/* Total revenue card. */}
            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <i className="fa-solid fa-indian-rupee-sign"></i>
                </div>
              </div>

              <p className="stat-label">Total Revenue</p>

              <h3>
                {formatCurrency(dashboardData?.totalRevenue)}
              </h3>

              <p className="stat-description">
                Revenue generated from sales
              </p>
            </div>

            {/* Total purchases card. */}
            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <i className="fa-solid fa-truck-ramp-box"></i>
                </div>
              </div>

              <p className="stat-label">Total Purchases</p>

              <h3>
                {formatCurrency(dashboardData?.totalPurchases)}
              </h3>

              <p className="stat-description">
                Total purchase expenditure
              </p>
            </div>

            {/* Total customers card. */}
            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <i className="fa-solid fa-users"></i>
                </div>
              </div>

              <p className="stat-label">Customers</p>

              <h3>
                {dashboardData?.totalCustomers ?? 0}
              </h3>

              <p className="stat-description">
                Customers in your business
              </p>
            </div>
          </div>

          {/* =================================================
              FINANCIAL OVERVIEW CHART
              ================================================= */}

          <div className="dashboard-chart-panel">
            {/* Chart header. */}
            <div className="dashboard-panel-header">
              {/* Chart title and description. */}
              <div>
                <h3>Financial Overview</h3>
                <p>
                  Compare your revenue, cost and operating expenses.
                </p>
              </div>

              {/* Chart icon. */}
              <div className="panel-header-icon">
                <i className="fa-solid fa-chart-column"></i>
              </div>
            </div>

            {/* Small financial summary above the chart. */}
            <div className="chart-summary-row">
              {/* Revenue summary. */}
              <div className="chart-summary-item">
                <span className="chart-summary-dot revenue-dot"></span>
                <div>
                  <span>Revenue</span>
                  <strong>
                    {formatCurrency(dashboardData?.totalRevenue)}
                  </strong>
                </div>
              </div>

              {/* Cost summary. */}
              <div className="chart-summary-item">
                <span className="chart-summary-dot cost-dot"></span>
                <div>
                  <span>Cost</span>
                  <strong>
                    {formatCurrency(dashboardData?.totalCost)}
                  </strong>
                </div>
              </div>

              {/* Expense summary. */}
              <div className="chart-summary-item">
                <span className="chart-summary-dot expense-dot"></span>
                <div>
                  <span>Expenses</span>
                  <strong>
                    {formatCurrency(dashboardData?.totalExpenses)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Responsive chart wrapper. */}
            <div className="dashboard-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={financialChartData}
                  margin={{
                    top: 25,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                  barCategoryGap="32%"
                >
                  {/* Subtle horizontal chart grid. */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f5"
                  />

                  {/* Financial category labels. */}
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#7d8697",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                    dy={8}
                  />

                  {/* Financial amount scale. */}
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={70}
                    tick={{
                      fill: "#9aa2b1",
                      fontSize: 10,
                    }}
                    tickFormatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />

                  {/* Premium custom tooltip. */}
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      fill: "rgba(52, 70, 154, 0.035)",
                    }}
                  />

                  {/* Chart legend. */}
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "11px",
                      color: "#697386",
                    }}
                  />

                  {/* Revenue bar. */}
                  <Bar
                    dataKey="amount"
                    name="Financial Amount"
                    radius={[8, 8, 2, 2]}
                    barSize={68}
                    fill="#34469a"
                    background={{
                      fill: "#f6f7fa",
                      radius: 8,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* =================================================
              FINANCIAL + INVENTORY PANELS
              ================================================= */}

          <div className="dashboard-section-grid">
            {/* Financial summary panel. */}
            <div className="dashboard-panel">
              {/* Panel header. */}
              <div className="dashboard-panel-header">
                <div>
                  <h3>Financial Summary</h3>
                  <p>Current financial position</p>
                </div>

                <div className="panel-header-icon">
                  <i className="fa-solid fa-wallet"></i>
                </div>
              </div>

              {/* Financial metrics. */}
              <div className="financial-list">
                {/* Revenue row. */}
                <div className="financial-row">
                  <div className="financial-row-label">
                    <div className="financial-icon">
                      <i className="fa-solid fa-arrow-trend-up"></i>
                    </div>
                    <span>Total Revenue</span>
                  </div>

                  <strong>
                    {formatCurrency(dashboardData?.totalRevenue)}
                  </strong>
                </div>

                {/* Cost row. */}
                <div className="financial-row">
                  <div className="financial-row-label">
                    <div className="financial-icon">
                      <i className="fa-solid fa-box-open"></i>
                    </div>
                    <span>Total Cost</span>
                  </div>

                  <strong>
                    {formatCurrency(dashboardData?.totalCost)}
                  </strong>
                </div>

                {/* Expenses row. */}
                <div className="financial-row">
                  <div className="financial-row-label">
                    <div className="financial-icon">
                      <i className="fa-solid fa-receipt"></i>
                    </div>
                    <span>Total Expenses</span>
                  </div>

                  <strong>
                    {formatCurrency(dashboardData?.totalExpenses)}
                  </strong>
                </div>

                {/* Gross profit row. */}
                <div className="financial-row">
                  <div className="financial-row-label">
                    <div className="financial-icon">
                      <i className="fa-solid fa-chart-line"></i>
                    </div>
                    <span>Gross Profit</span>
                  </div>

                  <strong>
                    {formatCurrency(dashboardData?.grossProfit)}
                  </strong>
                </div>

                {/* Net profit row. */}
                <div className="financial-row highlight-row">
                  <div className="financial-row-label">
                    <div className="financial-icon">
                      <i className="fa-solid fa-coins"></i>
                    </div>
                    <span>Net Profit</span>
                  </div>

                  <strong>
                    {formatCurrency(dashboardData?.profit)}
                  </strong>
                </div>

                {/* Loss row when applicable. */}
                {Number(dashboardData?.loss ?? 0) > 0 && (
                  <div className="financial-row loss-row">
                    <div className="financial-row-label">
                      <div className="financial-icon">
                        <i className="fa-solid fa-arrow-trend-down"></i>
                      </div>
                      <span>Loss</span>
                    </div>

                    <strong>
                      {formatCurrency(dashboardData?.loss)}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory overview panel. */}
            <div className="dashboard-panel">
              {/* Panel header. */}
              <div className="dashboard-panel-header">
                <div>
                  <h3>Inventory Overview</h3>
                  <p>Monitor your current stock position</p>
                </div>

                <div className="panel-header-icon">
                  <i className="fa-solid fa-boxes-stacked"></i>
                </div>
              </div>

              {/* Inventory metrics. */}
              <div className="inventory-summary">
                {/* Total products. */}
                <div className="inventory-card">
                  <div className="inventory-icon">
                    <i className="fa-solid fa-box"></i>
                  </div>

                  <div>
                    <span>Total Products</span>
                    <strong>
                      {dashboardData?.totalProducts ?? 0}
                    </strong>
                  </div>
                </div>

                {/* Low stock products. */}
                <div className="inventory-card">
                  <div className="inventory-icon">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>

                  <div>
                    <span>Low Stock Products</span>
                    <strong>
                      {dashboardData?.lowStockProducts ?? 0}
                    </strong>
                  </div>
                </div>

                {/* Customers. */}
                <div className="inventory-card">
                  <div className="inventory-icon">
                    <i className="fa-solid fa-user-group"></i>
                  </div>

                  <div>
                    <span>Total Customers</span>
                    <strong>
                      {dashboardData?.totalCustomers ?? 0}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Inventory status message. */}
              <div className="inventory-status">
                <i className="fa-solid fa-circle-check status-icon"></i>

                <div>
                  <strong>Inventory status</strong>

                  <p>
                    {Number(dashboardData?.lowStockProducts ?? 0) === 0
                      ? "All products are currently above the low-stock threshold."
                      : `${dashboardData.lowStockProducts} product(s) require stock attention.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              QUICK ACTIONS
              ================================================= */}

          <div className="dashboard-panel quick-actions-panel">
            {/* Panel header. */}
            <div className="dashboard-panel-header">
              <div>
                <h3>Quick Actions</h3>
                <p>Common tasks for managing your business</p>
              </div>

              <div className="panel-header-icon">
                <i className="fa-solid fa-bolt"></i>
              </div>
            </div>

            {/* Quick action buttons. */}
            <div className="quick-actions-grid">
              {/* Add product action. */}
              <button type="button" className="quick-action">
                <i className="fa-solid fa-plus"></i>
                <span>Add Product</span>
              </button>

              {/* Record sale action. */}
              <button type="button" className="quick-action">
                <i className="fa-solid fa-cart-plus"></i>
                <span>Record Sale</span>
              </button>

              {/* Create invoice action. */}
              <button type="button" className="quick-action">
                <i className="fa-solid fa-file-circle-plus"></i>
                <span>Create Invoice</span>
              </button>

              {/* Add expense action. */}
              <button type="button" className="quick-action">
                <i className="fa-solid fa-money-bill-wave"></i>
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;