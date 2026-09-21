import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../api/api";
import "./reports.css";

const Reports = () => {
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [activeRange, setActiveRange] = useState("this-month");

  const formatCurrency = (value) => {
    return `₹${Number(value ?? 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const getDateRange = (range) => {
    const today = new Date();

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const start = new Date(today);

    if (range === "today") {
      return {
        startDate: formatDate(today),
        endDate: formatDate(today),
      };
    }

    if (range === "this-week") {
      const day = today.getDay();
      const difference = day === 0 ? 6 : day - 1;

      start.setDate(today.getDate() - difference);

      return {
        startDate: formatDate(start),
        endDate: formatDate(today),
      };
    }

    if (range === "this-month") {
      start.setDate(1);

      return {
        startDate: formatDate(start),
        endDate: formatDate(today),
      };
    }

    if (range === "this-year") {
      start.setMonth(0);
      start.setDate(1);

      return {
        startDate: formatDate(start),
        endDate: formatDate(today),
      };
    }

    return {
      startDate: "",
      endDate: "",
    };
  };

  const fetchReport = useCallback(
    async (customStart, customEnd) => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const params = {};

        if (customStart) {
          params.startDate = customStart;
        }

        if (customEnd) {
          params.endDate = customEnd;
        }

        const response = await api.get("/reports/profit-loss", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        });

        setReport(response.data.report);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load financial report."
        );
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const range = getDateRange("this-month");

    setStartDate(range.startDate);
    setEndDate(range.endDate);

    fetchReport(range.startDate, range.endDate);
  }, [fetchReport]);

  const handleQuickRange = (range) => {
    setActiveRange(range);

    const dates = getDateRange(range);

    setStartDate(dates.startDate);
    setEndDate(dates.endDate);

    fetchReport(dates.startDate, dates.endDate);
  };

  const handleApplyFilter = () => {
    setActiveRange("custom");
    fetchReport(startDate, endDate);
  };

  const financialChartData = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
      {
        name: "Revenue",
        amount: Number(report.totalRevenue || 0),
      },
      {
        name: "Cost",
        amount: Number(report.totalCost || 0),
      },
      {
        name: "Expenses",
        amount: Number(report.totalExpenses || 0),
      },
    ];
  }, [report]);

  const profitLossData = useMemo(() => {
    if (!report) {
      return [];
    }

    const data = [];

    if (Number(report.profit || 0) > 0) {
      data.push({
        name: "Net Profit",
        value: Number(report.profit || 0),
      });
    }

    if (Number(report.loss || 0) > 0) {
      data.push({
        name: "Loss",
        value: Number(report.loss || 0),
      });
    }

    return data;
  }, [report]);

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <div className="reports-custom-tooltip">
        <p className="reports-tooltip-label">{label}</p>

        <strong>
          {formatCurrency(payload[0].value)}
        </strong>
      </div>
    );
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <div className="reports-custom-tooltip">
        <p className="reports-tooltip-label">
          {payload[0].name}
        </p>

        <strong>
          {formatCurrency(payload[0].value)}
        </strong>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading your financial reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-error">
        <i className="fa-solid fa-circle-exclamation"></i>

        <h2>Unable to load reports</h2>

        <p>{error}</p>

        <button
          type="button"
          className="reports-retry-btn"
          onClick={() => fetchReport(startDate, endDate)}
        >
          <i className="fa-solid fa-rotate-right"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="reports-sidebar">

        <Link to="/dashboard" className="reports-brand">
          <div className="reports-brand-icon">
            <i className="fa-solid fa-layer-group"></i>
          </div>

          <span>LedgerFlow</span>
        </Link>

        <nav className="reports-navigation">

          <Link
            to="/dashboard"
            className="reports-nav-item"
          >
            <i className="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/products"
            className="reports-nav-item"
          >
            <i className="fa-solid fa-box"></i>
            <span>Products</span>
          </Link>

          <Link
            to="/sales"
            className="reports-nav-item"
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Sales</span>
          </Link>

          <Link
            to="/purchases"
            className="reports-nav-item"
          >
            <i className="fa-solid fa-truck"></i>
            <span>Purchases</span>
          </Link>

          <Link
            to="/customers"
            className="reports-nav-item"
          >
            <i className="fa-solid fa-users"></i>
            <span>Customers</span>
          </Link>

          <Link
            to="/suppliers"
            className="reports-nav-item"
          >
            <i className="fa-solid fa-boxes-stacked"></i>
            <span>Suppliers</span>
          </Link>

          <Link
            to="/invoices"
            className="reports-nav-item"
          >
            <i className="fa-solid fa-file-invoice"></i>
            <span>Invoices</span>
          </Link>

          <Link
            to="/expenses"
            className="reports-nav-item"
          >
            <i className="fa-solid fa-wallet"></i>
            <span>Expenses</span>
          </Link>

          <Link
            to="/reports"
            className="reports-nav-item active"
          >
            <i className="fa-solid fa-chart-column"></i>
            <span>Reports</span>
          </Link>

          <Link
            to="/settings"
            className="reports-nav-item"
          >
            <i className="fa-solid fa-gear"></i>
            <span>Settings</span>
          </Link>

        </nav>

        <div className="reports-sidebar-bottom">

          <button
            type="button"
            className="reports-nav-item logout-item"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="reports-main">

        {/* HEADER */}

        <header className="reports-header">

          <div>
            <p className="reports-page-label">
              Business analytics
            </p>

            <h1>Reports</h1>

            <p className="reports-header-description">
              Analyze your business performance and financial position.
            </p>
          </div>

          <div className="reports-header-icon">
            <i className="fa-solid fa-chart-column"></i>
          </div>

        </header>

        <section className="reports-content">

          {/* ================= FILTER ================= */}

          <div className="reports-filter-panel">

            <div className="reports-filter-header">

              <div>
                <h2>Report Period</h2>

                <p>
                  Select a period to analyze your financial performance.
                </p>
              </div>

              <div className="filter-icon">
                <i className="fa-regular fa-calendar"></i>
              </div>

            </div>

            <div className="quick-range-buttons">

              <button
                type="button"
                className={
                  activeRange === "today"
                    ? "range-btn active"
                    : "range-btn"
                }
                onClick={() => handleQuickRange("today")}
              >
                Today
              </button>

              <button
                type="button"
                className={
                  activeRange === "this-week"
                    ? "range-btn active"
                    : "range-btn"
                }
                onClick={() => handleQuickRange("this-week")}
              >
                This Week
              </button>

              <button
                type="button"
                className={
                  activeRange === "this-month"
                    ? "range-btn active"
                    : "range-btn"
                }
                onClick={() => handleQuickRange("this-month")}
              >
                This Month
              </button>

              <button
                type="button"
                className={
                  activeRange === "this-year"
                    ? "range-btn active"
                    : "range-btn"
                }
                onClick={() => handleQuickRange("this-year")}
              >
                This Year
              </button>

            </div>

            <div className="custom-date-row">

              <div className="date-field">
                <label>From Date</label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setActiveRange("custom");
                  }}
                />
              </div>

              <div className="date-field">
                <label>To Date</label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setActiveRange("custom");
                  }}
                />
              </div>

              <button
                type="button"
                className="apply-filter-btn"
                onClick={handleApplyFilter}
              >
                <i className="fa-solid fa-filter"></i>
                Apply Filter
              </button>

            </div>

          </div>

          {/* ================= SUMMARY CARDS ================= */}

          <div className="reports-stat-grid">

            <div className="reports-stat-card revenue-card">
              <div className="reports-stat-icon">
                <i className="fa-solid fa-indian-rupee-sign"></i>
              </div>

              <div>
                <span>Total Revenue</span>

                <strong>
                  {formatCurrency(report?.totalRevenue)}
                </strong>

                <small>
                  Revenue generated from sales
                </small>
              </div>
            </div>

            <div className="reports-stat-card cost-card">
              <div className="reports-stat-icon">
                <i className="fa-solid fa-box-open"></i>
              </div>

              <div>
                <span>Total Cost</span>

                <strong>
                  {formatCurrency(report?.totalCost)}
                </strong>

                <small>
                  Product cost from sales
                </small>
              </div>
            </div>

            <div className="reports-stat-card expense-card">
              <div className="reports-stat-icon">
                <i className="fa-solid fa-receipt"></i>
              </div>

              <div>
                <span>Total Expenses</span>

                <strong>
                  {formatCurrency(report?.totalExpenses)}
                </strong>

                <small>
                  Operating expenses
                </small>
              </div>
            </div>

            <div className="reports-stat-card profit-card">
              <div className="reports-stat-icon">
                <i className="fa-solid fa-chart-line"></i>
              </div>

              <div>
                <span>Gross Profit</span>

                <strong>
                  {formatCurrency(report?.grossProfit)}
                </strong>

                <small>
                  Revenue minus product cost
                </small>
              </div>
            </div>

            <div
              className={
                Number(report?.loss || 0) > 0
                  ? "reports-stat-card loss-card"
                  : "reports-stat-card net-profit-card"
              }
            >
              <div className="reports-stat-icon">
                <i
                  className={
                    Number(report?.loss || 0) > 0
                      ? "fa-solid fa-arrow-trend-down"
                      : "fa-solid fa-coins"
                  }
                ></i>
              </div>

              <div>
                <span>
                  {Number(report?.loss || 0) > 0
                    ? "Net Loss"
                    : "Net Profit"}
                </span>

                <strong>
                  {formatCurrency(
                    Number(report?.loss || 0) > 0
                      ? report?.loss
                      : report?.profit
                  )}
                </strong>

                <small>
                  After operating expenses
                </small>
              </div>
            </div>

          </div>

          {/* ================= CHARTS ================= */}

          <div className="reports-chart-grid">

            {/* Financial comparison */}

            <div className="reports-panel financial-chart-panel">

              <div className="reports-panel-header">

                <div>
                  <h3>Financial Overview</h3>

                  <p>
                    Compare revenue, product cost and expenses.
                  </p>
                </div>

                <div className="reports-panel-icon">
                  <i className="fa-solid fa-chart-column"></i>
                </div>

              </div>

              <div className="reports-chart-wrapper">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={financialChartData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 10,
                      bottom: 10,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) =>
                        `₹${Number(value).toLocaleString("en-IN")}`
                      }
                    />

                    <Tooltip
                      content={<CustomBarTooltip />}
                    />

                    <Legend />

                    <Bar
                      dataKey="amount"
                      name="Amount"
                      fill="#34469a"
                      radius={[8, 8, 2, 2]}
                      barSize={65}
                    />

                  </BarChart>
                </ResponsiveContainer>

              </div>

            </div>

            {/* Profit/Loss chart */}

            <div className="reports-panel profit-chart-panel">

              <div className="reports-panel-header">

                <div>
                  <h3>Profit & Loss</h3>

                  <p>
                    Current net financial result.
                  </p>
                </div>

                <div className="reports-panel-icon">
                  <i className="fa-solid fa-chart-pie"></i>
                </div>

              </div>

              <div className="reports-pie-wrapper">

                {profitLossData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>

                      <Pie
                        data={profitLossData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                      >

                        {profitLossData.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === "Loss"
                                  ? "#dc4b4b"
                                  : "#34469a"
                              }
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip
                        content={<CustomPieTooltip />}
                      />

                      <Legend />

                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-profit-data">
                    <i className="fa-solid fa-chart-pie"></i>
                    <p>No profit or loss recorded</p>
                  </div>
                )}

              </div>

              <div className="profit-center-value">

                <span>
                  {Number(report?.loss || 0) > 0
                    ? "Net Loss"
                    : "Net Profit"}
                </span>

                <strong>
                  {formatCurrency(
                    Number(report?.loss || 0) > 0
                      ? report?.loss
                      : report?.profit
                  )}
                </strong>

              </div>

            </div>

          </div>

          {/* ================= P&L STATEMENT ================= */}

          <div className="reports-panel pnl-panel">

            <div className="reports-panel-header">

              <div>
                <h3>Profit & Loss Statement</h3>

                <p>
                  Detailed financial breakdown for the selected period.
                </p>
              </div>

              <div className="reports-panel-icon">
                <i className="fa-solid fa-file-invoice-dollar"></i>
              </div>

            </div>

            <div className="pnl-list">

              <div className="pnl-row">
                <div>
                  <span>Revenue</span>
                  <small>Income generated from sales</small>
                </div>

                <strong className="positive-value">
                  {formatCurrency(report?.totalRevenue)}
                </strong>
              </div>

              <div className="pnl-row">
                <div>
                  <span>Product Cost</span>
                  <small>Cost of products sold</small>
                </div>

                <strong className="negative-value">
                  -{formatCurrency(report?.totalCost)}
                </strong>
              </div>

              <div className="pnl-divider"></div>

              <div className="pnl-row subtotal-row">
                <div>
                  <span>Gross Profit</span>
                  <small>Revenue − Product Cost</small>
                </div>

                <strong>
                  {formatCurrency(report?.grossProfit)}
                </strong>
              </div>

              <div className="pnl-row">
                <div>
                  <span>Operating Expenses</span>
                  <small>Business expenses</small>
                </div>

                <strong className="negative-value">
                  -{formatCurrency(report?.totalExpenses)}
                </strong>
              </div>

              <div className="pnl-divider"></div>

              <div
                className={
                  Number(report?.loss || 0) > 0
                    ? "pnl-row final-row loss-final"
                    : "pnl-row final-row profit-final"
                }
              >
                <div>
                  <span>
                    {Number(report?.loss || 0) > 0
                      ? "Net Loss"
                      : "Net Profit"}
                  </span>

                  <small>
                    Gross Profit − Operating Expenses
                  </small>
                </div>

                <strong>
                  {formatCurrency(
                    Number(report?.loss || 0) > 0
                      ? report?.loss
                      : report?.profit
                  )}
                </strong>
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default Reports;