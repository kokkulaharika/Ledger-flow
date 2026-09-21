import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./customers.css";

const Customers = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);

  const [openActionId, setOpenActionId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
  });

  // --------------------------------------------------
  // Fetch Customers
  // --------------------------------------------------

  const fetchCustomers = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers", {
        params: {
          search: search.trim(),
          page: currentPage,
          limit: 10,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setCustomers(response.data.customers || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setCustomers([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token, navigate, search, currentPage]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  const totalCustomers = useMemo(() => {
    return customers.length;
  }, [customers]);

  const customersWithEmail = useMemo(() => {
    return customers.filter((customer) => customer.email?.trim()).length;
  }, [customers]);

  const customersWithGstin = useMemo(() => {
    return customers.filter((customer) => customer.gstin?.trim()).length;
  }, [customers]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  // --------------------------------------------------
  // Form Input
  // --------------------------------------------------

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Add Customer
  // --------------------------------------------------

  const handleAddCustomer = () => {
    setEditingCustomer(null);

    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      gstin: "",
    });

    setError("");
    setShowCustomerModal(true);
  };

  // --------------------------------------------------
  // Edit Customer
  // --------------------------------------------------

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      gstin: customer.gstin || "",
    });

    setOpenActionId(null);
    setError("");
    setShowCustomerModal(true);
  };

  // --------------------------------------------------
  // Close Modal
  // --------------------------------------------------

  const closeCustomerModal = () => {
    if (saving) return;

    setShowCustomerModal(false);
    setEditingCustomer(null);

    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      gstin: "",
    });
  };

  // --------------------------------------------------
  // Save Customer
  // --------------------------------------------------

  const handleSaveCustomer = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        gstin: formData.gstin.trim(),
      };

      if (editingCustomer) {
        await api.put(
          `/customers/${editingCustomer._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await api.post("/customers", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      closeCustomerModal();
      await fetchCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to save customer. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Delete Customer
  // --------------------------------------------------

  const handleDeleteCustomer = async () => {
    if (!deleteCustomer) return;

    try {
      setSaving(true);
      setError("");

      await api.delete(`/customers/${deleteCustomer._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeleteCustomer(null);
      setOpenActionId(null);

      if (customers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchCustomers();
      }
    } catch (err) {
      console.error("Error deleting customer:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to delete customer. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Date
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading && customers.length === 0) {
    return (
      <div className="customers-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading customers...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <div className="customers-page">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="dashboard-sidebar">

        {/* Brand */}
        <Link to="/dashboard" className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <i className="fa-solid fa-layer-group"></i>
          </div>

          <span>LedgerFlow</span>
        </Link>

        {/* Navigation */}
        <nav className="dashboard-navigation">

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="dashboard-nav-item"
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

          {/* Customers - Active */}
          <Link
            to="/customers"
            className="dashboard-nav-item active"
          >
            <i className="fa-solid fa-users"></i>
            <span>Customers</span>
          </Link>

          {/* Future Pages */}
          <button
            type="button"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-boxes-stacked"></i>
            <span>Suppliers</span>
          </button>

          <button
            type="button"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-file-invoice"></i>
            <span>Invoices</span>
          </button>

          <button
            type="button"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-wallet"></i>
            <span>Expenses</span>
          </button>

          <button
            type="button"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-chart-column"></i>
            <span>Reports</span>
          </button>

          <button
            type="button"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-gear"></i>
            <span>Settings</span>
          </button>

        </nav>

        {/* Logout */}
        <div className="dashboard-sidebar-bottom">

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
          MAIN
          ===================================================== */}

      <main className="customers-main">

        {/* Header */}
        <header className="customers-header">

          <div className="customers-header-left">

            <p className="customers-page-label">
              Customer management
            </p>

            <h1>Customers</h1>

            <p className="customers-header-description">
              Manage your customers and their contact information.
            </p>

          </div>

          <div className="customers-header-actions">

            <button
              type="button"
              className="customers-icon-button"
              aria-label="Notifications"
            >
              <i className="fa-regular fa-bell"></i>
            </button>

            <div className="customers-user">

              <div className="customers-user-avatar">
                LF
              </div>

              <div className="customers-user-info">
                <strong>Business Owner</strong>
                <span>LedgerFlow Business</span>
              </div>

            </div>

          </div>

        </header>


        {/* =====================================================
            CONTENT
            ===================================================== */}

        <section className="customers-content">
            <Link to="/dashboard" className="back-dashboard-btn">
  <i className="fa-solid fa-arrow-left"></i>
  <span>Back to Dashboard</span>
</Link>

          {/* Top Row */}
          <div className="customers-top-row">

            <div>
              <h2>Customer Overview</h2>

              <p>
                View, add and manage your customer records.
              </p>
            </div>

            <button
              type="button"
              className="customers-add-button"
              onClick={handleAddCustomer}
            >
              <i className="fa-solid fa-plus"></i>
              Add Customer
            </button>

          </div>


          {/* Error */}
          {error && (
            <div className="customers-error">

              <i className="fa-solid fa-circle-exclamation"></i>

              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

            </div>
          )}


          {/* Summary */}
          <div className="customers-stat-grid">

            <div className="customers-stat-card">

              <div className="customers-stat-icon">
                <i className="fa-solid fa-users"></i>
              </div>

              <p>Customers</p>

              <h3>{totalCustomers}</h3>

              <span>Customers on this page</span>

            </div>


            <div className="customers-stat-card">

              <div className="customers-stat-icon">
                <i className="fa-solid fa-envelope"></i>
              </div>

              <p>Email Available</p>

              <h3>{customersWithEmail}</h3>

              <span>Customers with email</span>

            </div>


            <div className="customers-stat-card">

              <div className="customers-stat-icon">
                <i className="fa-solid fa-file-invoice"></i>
              </div>

              <p>GST Registered</p>

              <h3>{customersWithGstin}</h3>

              <span>Customers with GSTIN</span>

            </div>

          </div>


          {/* Customer Panel */}
          <div className="customers-panel">

            {/* Panel Header */}
            <div className="customers-panel-header">

              <div>
                <h3>Customer List</h3>

                <p>
                  Search and manage your customer records.
                </p>
              </div>


              {/* Search */}
              <div className="customers-search">

                <i className="fa-solid fa-magnifying-glass"></i>

                <input
                  type="text"
                  placeholder="Search name, phone or email..."
                  value={search}
                  onChange={handleSearchChange}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}

              </div>

            </div>


            {/* Table */}
            <div className="customers-table-wrapper">

              <table className="customers-table">

                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>GSTIN</th>
                    <th>Address</th>
                    <th>Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {customers.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="customers-empty"
                      >

                        <div>

                          <i className="fa-solid fa-users"></i>

                          <strong>
                            {search
                              ? "No customers found"
                              : "No customers yet"}
                          </strong>

                          <span>
                            {search
                              ? "Try a different search term."
                              : "Add your first customer to get started."}
                          </span>

                          {!search && (
                            <button
                              type="button"
                              onClick={handleAddCustomer}
                            >
                              <i className="fa-solid fa-plus"></i>
                              Add Customer
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>

                  ) : (

                    customers.map((customer) => (

                      <tr key={customer._id}>

                        {/* Customer */}
                        <td>

                          <div className="customer-name-cell">

                            <div className="customer-avatar">
                              {customer.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {customer.name}
                              </strong>

                              <span>
                                Customer ID:{" "}
                                {customer._id?.slice(-6)}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* Phone */}
                        <td>

                          <span className="customer-phone">

                            <i className="fa-solid fa-phone"></i>

                            {customer.phone || "-"}

                          </span>

                        </td>


                        {/* Email */}
                        <td>
                          {customer.email || "-"}
                        </td>


                        {/* GSTIN */}
                        <td>

                          {customer.gstin ? (

                            <span className="customer-gstin">
                              {customer.gstin}
                            </span>

                          ) : (
                            "-"
                          )}

                        </td>


                        {/* Address */}
                        <td>

                          <span className="customer-address">
                            {customer.address || "-"}
                          </span>

                        </td>


                        {/* Date */}
                        <td>
                          {formatDate(customer.createdAt)}
                        </td>


                        {/* Actions */}
                        <td>

                          <div className="customer-actions">

                            <button
                              type="button"
                              className="customer-action-button"
                              onClick={() =>
                                setOpenActionId(
                                  openActionId === customer._id
                                    ? null
                                    : customer._id
                                )
                              }
                            >
                              <i className="fa-solid fa-ellipsis"></i>
                            </button>


                            {openActionId === customer._id && (

                              <div className="customer-action-menu">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditCustomer(customer)
                                  }
                                >
                                  <i className="fa-solid fa-pen"></i>
                                  Edit
                                </button>


                                <button
                                  type="button"
                                  className="delete-action"
                                  onClick={() => {
                                    setDeleteCustomer(customer);
                                    setOpenActionId(null);
                                  }}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                  Delete
                                </button>

                              </div>

                            )}

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>


            {/* Pagination */}
            {customers.length > 0 && (

              <div className="customers-pagination">

                <span>
                  Page {currentPage} of {totalPages}
                </span>


                <div>

                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.max(prev - 1, 1)
                      )
                    }
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>


                  <span className="customers-page-number">
                    {currentPage}
                  </span>


                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>

                </div>

              </div>

            )}

          </div>

        </section>

      </main>


      {/* =====================================================
          ADD / EDIT CUSTOMER MODAL
          ===================================================== */}

      {showCustomerModal && (

        <div
          className="customers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCustomerModal();
            }
          }}
        >

          <div className="customers-modal">

            <div className="customers-modal-header">

              <div>

                <h3>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h3>

                <p>
                  {editingCustomer
                    ? "Update customer information."
                    : "Add a new customer to LedgerFlow."}
                </p>

              </div>


              <button
                type="button"
                onClick={closeCustomerModal}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

            </div>


            <form
              className="customers-form"
              onSubmit={handleSaveCustomer}
            >

              <div className="customers-form-grid">

                <div className="customers-form-group">

                  <label>
                    Customer Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    required
                  />

                </div>


                <div className="customers-form-group">

                  <label>
                    Phone Number
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                  />

                </div>


                <div className="customers-form-group">

                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />

                </div>


                <div className="customers-form-group">

                  <label>GSTIN</label>

                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    placeholder="Enter GSTIN"
                  />

                </div>


                <div className="customers-form-group full-width">

                  <label>Address</label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter customer address"
                    rows="3"
                  />

                </div>

              </div>


              <div className="customers-modal-footer">

                <button
                  type="button"
                  className="customers-cancel-button"
                  onClick={closeCustomerModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="customers-save-button"
                  disabled={saving}
                >

                  {saving ? (

                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Saving...
                    </>

                  ) : (

                    <>
                      <i className="fa-solid fa-check"></i>

                      {editingCustomer
                        ? "Update Customer"
                        : "Add Customer"}
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE MODAL
          ===================================================== */}

      {deleteCustomer && (

        <div className="customers-modal-overlay">

          <div className="customers-delete-modal">

            <div className="customers-delete-icon">
              <i className="fa-solid fa-trash"></i>
            </div>

            <h3>Delete Customer?</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteCustomer.name}</strong>?
              This action cannot be undone.
            </p>


            <div className="customers-delete-actions">

              <button
                type="button"
                onClick={() => setDeleteCustomer(null)}
                disabled={saving}
              >
                Cancel
              </button>


              <button
                type="button"
                className="confirm-delete-button"
                onClick={handleDeleteCustomer}
                disabled={saving}
              >

                {saving ? (

                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Deleting...
                  </>

                ) : (

                  <>
                    <i className="fa-solid fa-trash"></i>
                    Delete Customer
                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Customers;

