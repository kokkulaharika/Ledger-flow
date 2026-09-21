import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./expenses.css";

const Expenses = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteExpense, setDeleteExpense] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);

  const itemsPerPage = 10;
  const token = localStorage.getItem("token");

  const fetchExpenses = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setExpenses(response.data.expenses || []);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load expenses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        expenses
          .map((expense) => expense.category)
          .filter((item) => item && item.trim() !== "")
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !searchValue ||
        expense.title?.toLowerCase().includes(searchValue) ||
        expense.expenseId?.toLowerCase().includes(searchValue) ||
        expense.category?.toLowerCase().includes(searchValue) ||
        expense.description?.toLowerCase().includes(searchValue) ||
        expense.paymentMethod?.toLowerCase().includes(searchValue);

      const matchesCategory =
        !category || expense.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, category]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / itemsPerPage)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedExpenses = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;

    return filteredExpenses.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredExpenses, page]);

  const totalAmount = useMemo(() => {
    return expenses.reduce(
      (total, expense) => total + Number(expense.amount || 0),
      0
    );
  }, [expenses]);

  const filteredAmount = useMemo(() => {
    return filteredExpenses.reduce(
      (total, expense) => total + Number(expense.amount || 0),
      0
    );
  }, [filteredExpenses]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setPage(1);
  };

  const openAddExpenseModal = () => {
    setEditingExpense(null);
    setShowExpenseModal(true);
    setOpenActionId(null);
    setError("");
  };

  const openEditExpenseModal = (expense) => {
    setEditingExpense(expense);
    setShowExpenseModal(true);
    setOpenActionId(null);
    setError("");
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
    setEditingExpense(null);
  };

  const handleSaveExpense = async (formData) => {
    try {
      setError("");

      if (editingExpense) {
        const id = editingExpense._id || editingExpense.id;

        await api.put(`/expenses/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await api.post("/expenses", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      closeExpenseModal();
      await fetchExpenses();
    } catch (err) {
      console.error("Error saving expense:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to save expense. Please try again."
      );
    }
  };

  const openDeleteModal = (expense) => {
    setDeleteExpense(expense);
    setOpenActionId(null);
  };

  const closeDeleteModal = () => {
    setDeleteExpense(null);
  };

  const handleDeleteExpense = async () => {
    if (!deleteExpense) return;

    try {
      setError("");

      const id = deleteExpense._id || deleteExpense.id;

      await api.delete(`/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      closeDeleteModal();
      await fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to delete expense. Please try again."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDateInputValue = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
  };

  const ExpenseModal = () => {
    const [formData, setFormData] = useState({
      expenseId: editingExpense?.expenseId || "",
      title: editingExpense?.title || "",
      category: editingExpense?.category || "",
      amount: editingExpense?.amount ?? "",
      description: editingExpense?.description || "",
      date:
        getDateInputValue(editingExpense?.date) ||
        new Date().toISOString().split("T")[0],
      paymentMethod:
        editingExpense?.paymentMethod || "Cash",
    });

    const [formError, setFormError] = useState("");

    const handleChange = (e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (
        !formData.expenseId.trim() ||
        !formData.title.trim() ||
        !formData.category.trim() ||
        formData.amount === "" ||
        !formData.date ||
        !formData.paymentMethod
      ) {
        setFormError("Please fill all required fields.");
        return;
      }

      if (Number(formData.amount) < 0) {
        setFormError("Amount cannot be negative.");
        return;
      }

      const payload = {
        expenseId: formData.expenseId.trim(),
        title: formData.title.trim(),
        category: formData.category.trim(),
        amount: Number(formData.amount),
        description: formData.description.trim(),
        date: formData.date,
        paymentMethod: formData.paymentMethod,
      };

      await handleSaveExpense(payload);
    };

    return (
      <div className="expenses-modal-overlay">
        <div className="expenses-modal">
          <div className="expenses-modal-header">
            <div>
              <h2>
                {editingExpense
                  ? "Edit Expense"
                  : "Add New Expense"}
              </h2>

              <p>
                {editingExpense
                  ? "Update expense information"
                  : "Record a new business expense"}
              </p>
            </div>

            <button
              type="button"
              className="expenses-modal-close"
              onClick={closeExpenseModal}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="expenses-form-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{formError}</span>
              </div>
            )}

            <div className="expenses-form-grid">
              <div className="expenses-form-group">
                <label>
                  Expense ID <span>*</span>
                </label>

                <input
                  type="text"
                  name="expenseId"
                  value={formData.expenseId}
                  onChange={handleChange}
                  placeholder="e.g. EXP-001"
                  disabled={!!editingExpense}
                  required
                />
              </div>

              <div className="expenses-form-group">
                <label>
                  Title <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Office Rent"
                  required
                />
              </div>

              <div className="expenses-form-group">
                <label>
                  Category <span>*</span>
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Rent, Travel, Utilities"
                  required
                />
              </div>

              <div className="expenses-form-group">
                <label>
                  Amount <span>*</span>
                </label>

                <div className="expenses-input-with-icon">
                  <span>₹</span>

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="expenses-form-group">
                <label>
                  Payment Method <span>*</span>
                </label>

                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>
                </select>
              </div>

              <div className="expenses-form-group">
                <label>
                  Date <span>*</span>
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="expenses-form-group expenses-full-width">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter expense description..."
                  rows="4"
                />
              </div>
            </div>

            <div className="expenses-modal-footer">
              <button
                type="button"
                className="expenses-secondary-btn"
                onClick={closeExpenseModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="expenses-primary-btn"
              >
                <i className="fa-solid fa-check"></i>

                {editingExpense
                  ? "Update Expense"
                  : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DeleteModal = () => {
    if (!deleteExpense) return null;

    return (
      <div className="expenses-modal-overlay">
        <div className="expenses-delete-modal">
          <div className="expenses-delete-icon">
            <i className="fa-solid fa-trash"></i>
          </div>

          <h2>Delete Expense?</h2>

          <p>
            Are you sure you want to delete{" "}
            <strong>{deleteExpense.title}</strong>? This action
            cannot be undone.
          </p>

          <div className="expenses-delete-actions">
            <button
              type="button"
              className="expenses-secondary-btn"
              onClick={closeDeleteModal}
            >
              Cancel
            </button>

            <button
              type="button"
              className="expenses-danger-btn"
              onClick={handleDeleteExpense}
            >
              <i className="fa-solid fa-trash"></i>
              Delete Expense
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <i className="fa-solid fa-layer-group"></i>
          </div>

          <span>LedgerFlow</span>
        </div>

        <nav className="dashboard-navigation">
          <Link
            to="/dashboard"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/products"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-box"></i>
            <span>Products</span>
          </Link>

          <Link
            to="/sales"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Sales</span>
          </Link>

          <Link
            to="/purchases"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-truck"></i>
            <span>Purchases</span>
          </Link>

          <Link
            to="/customers"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-users"></i>
            <span>Customers</span>
          </Link>

          <Link
            to="/suppliers"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-boxes-stacked"></i>
            <span>Suppliers</span>
          </Link>

          <Link
            to="/invoices"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-file-invoice"></i>
            <span>Invoices</span>
          </Link>

          <Link
            to="/expenses"
            className="dashboard-nav-item active"
          >
            <i className="fa-solid fa-wallet"></i>
            <span>Expenses</span>
          </Link>

          <Link
            to="/reports"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-chart-column"></i>
            <span>Reports</span>
          </Link>

          <Link
            to="/settings"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-gear"></i>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <button
            type="button"
            className="dashboard-nav-item dashboard-logout"
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

      <main className="dashboard-main expenses-main">
        <div className="expenses-page-header">
          <div>
            <div className="expenses-breadcrumb">
              <Link
                to="/dashboard"
                className="expenses-breadcrumb-link"
              >
                Dashboard
              </Link>

              <i className="fa-solid fa-chevron-right"></i>

              <strong>Expenses</strong>
            </div>

            <h1>Expenses</h1>

            <p>
              Track and manage your business expenses and payments.
            </p>
          </div>

          <button
            type="button"
            className="expenses-primary-btn expenses-add-btn"
            onClick={openAddExpenseModal}
          >
            <i className="fa-solid fa-plus"></i>
            Add Expense
          </button>
        </div>

        {error && (
          <div className="expenses-error">
            <div>
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        <div className="expenses-summary-grid">
          <div className="expenses-summary-card">
            <div className="expenses-summary-icon">
              <i className="fa-solid fa-receipt"></i>
            </div>

            <div>
              <span>Total Expenses</span>
              <strong>{expenses.length}</strong>
            </div>
          </div>

          <div className="expenses-summary-card">
            <div className="expenses-summary-icon amount">
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>

            <div>
              <span>Total Amount</span>

              <strong>
                ₹
                {totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>

          <div className="expenses-summary-card">
            <div className="expenses-summary-icon">
              <i className="fa-solid fa-layer-group"></i>
            </div>

            <div>
              <span>Categories</span>
              <strong>{categories.length}</strong>
            </div>
          </div>

          <div className="expenses-summary-card">
            <div className="expenses-summary-icon warning">
              <i className="fa-solid fa-filter"></i>
            </div>

            <div>
              <span>Filtered Amount</span>

              <strong>
                ₹
                {filteredAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>
        </div>

        <div className="expenses-filter-panel">
          <div className="expenses-search-box">
            <i className="fa-solid fa-magnifying-glass"></i>

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by title, ID, category..."
            />
          </div>

          <div className="expenses-category-filter">
            <i className="fa-solid fa-filter"></i>

            <select
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {(search || category) && (
            <button
              type="button"
              className="expenses-clear-btn"
              onClick={handleClearFilters}
            >
              <i className="fa-solid fa-rotate-left"></i>
              Clear
            </button>
          )}
        </div>

        <div className="expenses-table-card">
          <div className="expenses-table-header">
            <div>
              <h2>Expense Records</h2>

              <p>
                {filteredExpenses.length}{" "}
                {filteredExpenses.length === 1
                  ? "expense"
                  : "expenses"}{" "}
                found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="expenses-loading">
              <div className="expenses-spinner"></div>
              <p>Loading expenses...</p>
            </div>
          ) : paginatedExpenses.length === 0 ? (
            <div className="expenses-empty">
              <div className="expenses-empty-icon">
                <i className="fa-solid fa-receipt"></i>
              </div>

              <h3>No Expenses Found</h3>

              <p>
                {search || category
                  ? "Try changing your search or filter."
                  : "Start by adding your first expense."}
              </p>

              {!search && !category && (
                <button
                  type="button"
                  className="expenses-primary-btn"
                  onClick={openAddExpenseModal}
                >
                  <i className="fa-solid fa-plus"></i>
                  Add Expense
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="expenses-table-wrapper">
                <table className="expenses-table">
                  <thead>
                    <tr>
                      <th>Expense</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedExpenses.map((expense) => {
                      const id = expense._id || expense.id;

                      return (
                        <tr key={id}>
                          <td>
                            <div className="expenses-name-cell">
                              <div className="expenses-table-icon">
                                <i className="fa-solid fa-receipt"></i>
                              </div>

                              <div>
                                <strong>
                                  {expense.title}
                                </strong>

                                <span>
                                  ID: {expense.expenseId}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="expenses-category">
                              {expense.category}
                            </span>
                          </td>

                          <td>
                            <strong className="expenses-amount">
                              ₹
                              {Number(
                                expense.amount || 0
                              ).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`expenses-payment-method ${expense.paymentMethod
                                ?.toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              <i
                                className={
                                  expense.paymentMethod ===
                                  "Cash"
                                    ? "fa-solid fa-money-bill"
                                    : expense.paymentMethod ===
                                      "UPI"
                                    ? "fa-solid fa-mobile-screen-button"
                                    : expense.paymentMethod ===
                                      "Card"
                                    ? "fa-solid fa-credit-card"
                                    : "fa-solid fa-building-columns"
                                }
                              ></i>

                              {expense.paymentMethod}
                            </span>
                          </td>

                          <td>
                            <span className="expenses-date">
                              {formatDate(expense.date)}
                            </span>
                          </td>

                          <td>
                            <span
                              className="expenses-description"
                              title={
                                expense.description || ""
                              }
                            >
                              {expense.description || "-"}
                            </span>
                          </td>

                          <td>
                            <div className="expenses-actions-wrapper">
                              <button
                                type="button"
                                className="expenses-action-btn"
                                onClick={() =>
                                  setOpenActionId(
                                    openActionId === id
                                      ? null
                                      : id
                                  )
                                }
                                title="More actions"
                              >
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                              </button>

                              {openActionId === id && (
                                <div className="expenses-action-menu">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditExpenseModal(
                                        expense
                                      )
                                    }
                                  >
                                    <i className="fa-solid fa-pen"></i>
                                    Edit Expense
                                  </button>

                                  <div className="expenses-menu-divider"></div>

                                  <button
                                    type="button"
                                    className="delete-action"
                                    onClick={() =>
                                      openDeleteModal(
                                        expense
                                      )
                                    }
                                  >
                                    <i className="fa-solid fa-trash"></i>
                                    Delete Expense
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="expenses-pagination">
                <span>
                  Page {page} of {totalPages}
                </span>

                <div className="expenses-pagination-buttons">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((prev) =>
                        Math.max(1, prev - 1)
                      )
                    }
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  )
                    .filter(
                      (pageNumber) =>
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        Math.abs(pageNumber - page) <= 1
                    )
                    .map((pageNumber, index, arr) => {
                      const previousPage = arr[index - 1];

                      return (
                        <React.Fragment key={pageNumber}>
                          {previousPage &&
                            pageNumber - previousPage > 1 && (
                              <span className="expenses-pagination-dots">
                                ...
                              </span>
                            )}

                          <button
                            type="button"
                            className={
                              page === pageNumber
                                ? "active"
                                : ""
                            }
                            onClick={() =>
                              setPage(pageNumber)
                            }
                          >
                            {pageNumber}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((prev) =>
                        Math.min(totalPages, prev + 1)
                      )
                    }
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {showExpenseModal && <ExpenseModal />}
      {deleteExpense && <DeleteModal />}
    </div>
  );
};

export default Expenses;