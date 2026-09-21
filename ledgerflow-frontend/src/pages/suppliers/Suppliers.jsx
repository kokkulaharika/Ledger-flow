import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./suppliers.css";

const Suppliers = () => {
const navigate = useNavigate();

const [suppliers, setSuppliers] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [search, setSearch] = useState("");
const [page, setPage] = useState(1);

const [showSupplierModal, setShowSupplierModal] = useState(false);
const [editingSupplier, setEditingSupplier] = useState(null);

const [deleteSupplier, setDeleteSupplier] = useState(null);
const [openActionId, setOpenActionId] = useState(null);

const token = localStorage.getItem("token");

const ITEMS_PER_PAGE = 10;

// --------------------------------------------------
// Fetch Suppliers
// --------------------------------------------------
const fetchSuppliers = useCallback(async () => {
if (!token) {
navigate("/login");
return;
}


try {
  setLoading(true);
  setError("");

  const response = await api.get("/suppliers", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.data?.success) {
    setSuppliers(response.data.suppliers || []);
  } else {
    setSuppliers([]);
  }
} catch (err) {
  console.error("Error fetching suppliers:", err);

  if (err.response?.status === 401) {
    localStorage.removeItem("token");
    navigate("/login");
    return;
  }

  setError(
    err.response?.data?.message ||
      "Failed to load suppliers. Please try again."
  );
} finally {
  setLoading(false);
}


}, [token, navigate]);

useEffect(() => {
fetchSuppliers();
}, [fetchSuppliers]);

// --------------------------------------------------
// Search
// --------------------------------------------------
const handleSearchChange = (e) => {
setSearch(e.target.value);
setPage(1);
};

// --------------------------------------------------
// Filter Suppliers
// --------------------------------------------------
const filteredSuppliers = useMemo(() => {
const searchTerm = search.trim().toLowerCase();


if (!searchTerm) {
  return suppliers;
}

return suppliers.filter((supplier) => {
  return (
    supplier.name?.toLowerCase().includes(searchTerm) ||
    supplier.phone?.toLowerCase().includes(searchTerm) ||
    supplier.email?.toLowerCase().includes(searchTerm) ||
    supplier.address?.toLowerCase().includes(searchTerm)
  );
});


}, [suppliers, search]);

// --------------------------------------------------
// Pagination
// --------------------------------------------------
const totalSuppliers = filteredSuppliers.length;

const totalPages = Math.max(
1,
Math.ceil(totalSuppliers / ITEMS_PER_PAGE)
);

const currentPageSuppliers = filteredSuppliers.slice(
(page - 1) * ITEMS_PER_PAGE,
page * ITEMS_PER_PAGE
);

useEffect(() => {
if (page > totalPages) {
setPage(totalPages);
}
}, [page, totalPages]);

const handlePageChange = (newPage) => {
if (newPage < 1 || newPage > totalPages) return;
setPage(newPage);
setOpenActionId(null);
};

// --------------------------------------------------
// Supplier Modal
// --------------------------------------------------
const openAddSupplierModal = () => {
setEditingSupplier(null);
setShowSupplierModal(true);
setOpenActionId(null);
};

const openEditSupplierModal = (supplier) => {
setEditingSupplier(supplier);
setShowSupplierModal(true);
setOpenActionId(null);
};

const closeSupplierModal = () => {
setShowSupplierModal(false);
setEditingSupplier(null);
};

// --------------------------------------------------
// Save Supplier
// --------------------------------------------------
const handleSaveSupplier = async (formData) => {
try {
setError("");


  if (editingSupplier) {
    await api.put(
      `/suppliers/${editingSupplier._id || editingSupplier.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } else {
    await api.post("/suppliers", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  closeSupplierModal();
  await fetchSuppliers();
  setPage(1);
} catch (err) {
  console.error("Error saving supplier:", err);

  if (err.response?.status === 401) {
    localStorage.removeItem("token");
    navigate("/login");
    return;
  }

  setError(
    err.response?.data?.message ||
      "Failed to save supplier. Please try again."
  );
}


};

// --------------------------------------------------
// Delete Supplier
// --------------------------------------------------
const openDeleteModal = (supplier) => {
setDeleteSupplier(supplier);
setOpenActionId(null);
};

const closeDeleteModal = () => {
setDeleteSupplier(null);
};

const handleDeleteSupplier = async () => {
if (!deleteSupplier) return;


try {
  setError("");

  const supplierId = deleteSupplier._id || deleteSupplier.id;

  await api.delete(`/suppliers/${supplierId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  closeDeleteModal();

  await fetchSuppliers();

  if (
    currentPageSuppliers.length === 1 &&
    page > 1
  ) {
    setPage((prev) => prev - 1);
  }
} catch (err) {
  console.error("Error deleting supplier:", err);

  if (err.response?.status === 401) {
    localStorage.removeItem("token");
    navigate("/login");
    return;
  }

  setError(
    err.response?.data?.message ||
      "Failed to delete supplier. Please try again."
  );
}

};

// --------------------------------------------------
// Supplier Form Modal
// --------------------------------------------------
const SupplierModal = () => {
const [formData, setFormData] = useState({
name: editingSupplier?.name || "",
phone: editingSupplier?.phone || "",
email: editingSupplier?.email || "",
address: editingSupplier?.address || "",
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

  if (!formData.name.trim() || !formData.phone.trim()) {
    setFormError("Supplier name and phone are required.");
    return;
  }

  if (formData.phone.trim().length < 10) {
    setFormError("Please enter a valid phone number.");
    return;
  }

  if (
    formData.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
  ) {
    setFormError("Please enter a valid email address.");
    return;
  }

  const payload = {
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim(),
    address: formData.address.trim(),
  };

  await handleSaveSupplier(payload);
};

return (
  <div className="suppliers-modal-overlay">
    <div className="suppliers-modal">
      <div className="suppliers-modal-header">
        <div>
          <h2>
            {editingSupplier
              ? "Edit Supplier"
              : "Add New Supplier"}
          </h2>

          <p>
            {editingSupplier
              ? "Update supplier information"
              : "Add a new supplier to your business"}
          </p>
        </div>

        <button
          type="button"
          className="suppliers-modal-close"
          onClick={closeSupplierModal}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {formError && (
          <div className="suppliers-form-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{formError}</span>
          </div>
        )}

        <div className="suppliers-form-grid">
          <div className="suppliers-form-group suppliers-full-width">
            <label>
              Supplier Name <span>*</span>
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter supplier name"
              required
            />
          </div>

          <div className="suppliers-form-group">
            <label>
              Phone <span>*</span>
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="suppliers-form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </div>

          <div className="suppliers-form-group suppliers-full-width">
            <label>Address</label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter supplier address"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="suppliers-modal-footer">
          <button
            type="button"
            className="suppliers-secondary-btn"
            onClick={closeSupplierModal}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="suppliers-primary-btn"
          >
            <i className="fa-solid fa-check"></i>

            {editingSupplier
              ? "Update Supplier"
              : "Add Supplier"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

};

// --------------------------------------------------
// Delete Modal
// --------------------------------------------------
const DeleteModal = () => {
if (!deleteSupplier) return null;

return (
  <div className="suppliers-modal-overlay">
    <div className="suppliers-delete-modal">
      <div className="suppliers-delete-icon">
        <i className="fa-solid fa-trash"></i>
      </div>

      <h2>Delete Supplier?</h2>

      <p>
        Are you sure you want to delete{" "}
        <strong>{deleteSupplier.name}</strong>? This action
        cannot be undone.
      </p>

      <div className="suppliers-delete-actions">
        <button
          type="button"
          className="suppliers-secondary-btn"
          onClick={closeDeleteModal}
        >
          Cancel
        </button>

        <button
          type="button"
          className="suppliers-danger-btn"
          onClick={handleDeleteSupplier}
        >
          <i className="fa-solid fa-trash"></i>
          Delete Supplier
        </button>
      </div>
    </div>
  </div>
);


};

// --------------------------------------------------
// Pagination Buttons
// --------------------------------------------------
const renderPaginationButtons = () => {
if (totalPages <= 1) return null;


const buttons = [];

buttons.push(
  <button
    key="previous"
    type="button"
    disabled={page === 1}
    onClick={() => handlePageChange(page - 1)}
  >
    <i className="fa-solid fa-chevron-left"></i>
  </button>
);

const maxVisiblePages = 5;

let startPage = Math.max(
  1,
  page - Math.floor(maxVisiblePages / 2)
);

let endPage = Math.min(
  totalPages,
  startPage + maxVisiblePages - 1
);

if (endPage - startPage < maxVisiblePages - 1) {
  startPage = Math.max(
    1,
    endPage - maxVisiblePages + 1
  );
}

if (startPage > 1) {
  buttons.push(
    <button
      key={1}
      type="button"
      className={page === 1 ? "active" : ""}
      onClick={() => handlePageChange(1)}
    >
      1
    </button>
  );

  if (startPage > 2) {
    buttons.push(
      <span
        key="dots-start"
        className="suppliers-pagination-dots"
      >
        ...
      </span>
    );
  }
}

for (let i = startPage; i <= endPage; i++) {
  if (i === 1 && startPage > 1) continue;

  buttons.push(
    <button
      key={i}
      type="button"
      className={page === i ? "active" : ""}
      onClick={() => handlePageChange(i)}
    >
      {i}
    </button>
  );
}

if (endPage < totalPages) {
  if (endPage < totalPages - 1) {
    buttons.push(
      <span
        key="dots-end"
        className="suppliers-pagination-dots"
      >
        ...
      </span>
    );
  }

  buttons.push(
    <button
      key={totalPages}
      type="button"
      className={page === totalPages ? "active" : ""}
      onClick={() => handlePageChange(totalPages)}
    >
      {totalPages}
    </button>
  );
}

buttons.push(
  <button
    key="next"
    type="button"
    disabled={page === totalPages}
    onClick={() => handlePageChange(page + 1)}
  >
    <i className="fa-solid fa-chevron-right"></i>
  </button>
);

return buttons;

};

// --------------------------------------------------
// Render
// --------------------------------------------------
return ( <div className="dashboard-container">
{/* Sidebar */} <aside className="dashboard-sidebar"> <div className="dashboard-brand"> <div className="dashboard-brand-icon"> <i className="fa-solid fa-layer-group"></i> </div>


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
        className="dashboard-nav-item active"
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
        className="dashboard-nav-item"
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

  {/* Main Content */}
  <main className="dashboard-main suppliers-main">
    <div className="suppliers-page-header">
      <div>
        <div className="suppliers-breadcrumb">
          <Link
            to="/dashboard"
            className="suppliers-breadcrumb-link"
          >
            Dashboard
          </Link>

          <i className="fa-solid fa-chevron-right"></i>

          <strong>Suppliers</strong>
        </div>

        <h1>Suppliers</h1>

        <p>
          Manage your suppliers and their contact information.
        </p>
      </div>

      <button
        type="button"
        className="suppliers-primary-btn suppliers-add-btn"
        onClick={openAddSupplierModal}
      >
        <i className="fa-solid fa-plus"></i>
        Add Supplier
      </button>
    </div>

    {/* Error */}
    {error && (
      <div className="suppliers-error">
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

    {/* Summary Cards */}
    <div className="suppliers-summary-grid">
      <div className="suppliers-summary-card">
        <div className="suppliers-summary-icon">
          <i className="fa-solid fa-boxes-stacked"></i>
        </div>

        <div>
          <span>Total Suppliers</span>
          <strong>{suppliers.length}</strong>
        </div>
      </div>

      <div className="suppliers-summary-card">
        <div className="suppliers-summary-icon">
          <i className="fa-solid fa-layer-group"></i>
        </div>

        <div>
          <span>Current Page</span>
          <strong>
            {page} / {totalPages}
          </strong>
        </div>
      </div>

      <div className="suppliers-summary-card">
        <div className="suppliers-summary-icon">
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>

        <div>
          <span>Search Results</span>
          <strong>{totalSuppliers}</strong>
        </div>
      </div>

      <div className="suppliers-summary-card">
        <div className="suppliers-summary-icon">
          <i className="fa-solid fa-address-book"></i>
        </div>

        <div>
          <span>Contact Details</span>
          <strong>
            {suppliers.filter(
              (supplier) =>
                supplier.email || supplier.phone
            ).length}
          </strong>
        </div>
      </div>
    </div>

    {/* Search */}
    <div className="suppliers-filter-panel">
      <div className="suppliers-search-box">
        <i className="fa-solid fa-magnifying-glass"></i>

        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by supplier, phone, email or address..."
        />
      </div>

      {search && (
        <button
          type="button"
          className="suppliers-clear-btn"
          onClick={() => {
            setSearch("");
            setPage(1);
          }}
        >
          <i className="fa-solid fa-rotate-left"></i>
          Clear
        </button>
      )}
    </div>

    {/* Suppliers Table */}
    <div className="suppliers-table-card">
      <div className="suppliers-table-header">
        <div>
          <h2>Supplier List</h2>

          <p>
            {totalSuppliers}{" "}
            {totalSuppliers === 1
              ? "supplier"
              : "suppliers"}{" "}
            found
          </p>
        </div>
      </div>

      {loading ? (
        <div className="suppliers-loading">
          <div className="suppliers-spinner"></div>
          <p>Loading suppliers...</p>
        </div>
      ) : totalSuppliers === 0 ? (
        <div className="suppliers-empty">
          <div className="suppliers-empty-icon">
            <i className="fa-solid fa-boxes-stacked"></i>
          </div>

          <h3>No Suppliers Found</h3>

          <p>
            {search
              ? "Try changing your search."
              : "Start by adding your first supplier."}
          </p>

          {!search && (
            <button
              type="button"
              className="suppliers-primary-btn"
              onClick={openAddSupplierModal}
            >
              <i className="fa-solid fa-plus"></i>
              Add Supplier
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="suppliers-table-wrapper">
            <table className="suppliers-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentPageSuppliers.map((supplier) => {
                  const supplierId =
                    supplier._id || supplier.id;

                  return (
                    <tr key={supplierId}>
                      <td>
                        <div className="suppliers-name-cell">
                          <div className="suppliers-table-icon">
                            <i className="fa-solid fa-building"></i>
                          </div>

                          <div>
                            <strong>{supplier.name}</strong>

                            <span>
                              ID: {supplierId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="suppliers-contact-cell">
                          <i className="fa-solid fa-phone"></i>
                          <span>
                            {supplier.phone || "—"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="suppliers-contact-cell">
                          <i className="fa-solid fa-envelope"></i>
                          <span>
                            {supplier.email || "—"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="suppliers-address">
                          {supplier.address || "—"}
                        </span>
                      </td>

                      <td>
                        <div className="suppliers-actions-wrapper">
                          <button
                            type="button"
                            className="suppliers-action-btn"
                            onClick={() =>
                              setOpenActionId(
                                openActionId === supplierId
                                  ? null
                                  : supplierId
                              )
                            }
                          >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                          </button>

                          {openActionId === supplierId && (
                            <div className="suppliers-action-menu">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditSupplierModal(
                                    supplier
                                  )
                                }
                              >
                                <i className="fa-solid fa-pen"></i>
                                Edit Supplier
                              </button>

                              <div className="suppliers-menu-divider"></div>

                              <button
                                type="button"
                                className="delete-action"
                                onClick={() =>
                                  openDeleteModal(
                                    supplier
                                  )
                                }
                              >
                                <i className="fa-solid fa-trash"></i>
                                Delete Supplier
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

          {totalPages > 1 && (
            <div className="suppliers-pagination">
              <span>
                Showing{" "}
                {(page - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(
                  page * ITEMS_PER_PAGE,
                  totalSuppliers
                )}{" "}
                of {totalSuppliers} suppliers
              </span>

              <div className="suppliers-pagination-buttons">
                {renderPaginationButtons()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </main>

  {/* Modals */}
  {showSupplierModal && <SupplierModal />}
  {deleteSupplier && <DeleteModal />}
</div>
);
};

export default Suppliers;
