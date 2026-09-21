import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./sales.css";

const Sales = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const salesPerPage = 10;

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const [deleteSale, setDeleteSale] = useState(null);

  const [openActionId, setOpenActionId] = useState(null);

  const [customerName, setCustomerName] = useState("");

  const [saleItems, setSaleItems] = useState([
    {
      product: "",
      quantity: 1,
    },
  ]);

  const [saving, setSaving] = useState(false);

  // --------------------------------------------------
  // Fetch Sales
  // --------------------------------------------------

  const fetchSales = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/sales", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setSales(response.data.sales || []);
      } else {
        setSales([]);
      }
    } catch (err) {
      console.error("Error fetching sales:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load sales. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  // --------------------------------------------------
  // Fetch Products
  // --------------------------------------------------

  const fetchProducts = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api.get("/products", {
        params: {
          limit: 1000,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [fetchSales, fetchProducts]);

  // --------------------------------------------------
  // Summary Calculations
  // --------------------------------------------------

  const totalRevenue = useMemo(() => {
    return sales.reduce(
      (total, sale) => total + Number(sale.totalAmount || 0),
      0
    );
  }, [sales]);

  const totalItemsSold = useMemo(() => {
    return sales.reduce((total, sale) => {
      return (
        total +
        (sale.products || []).reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )
      );
    }, 0);
  }, [sales]);

  const totalCustomers = useMemo(() => {
    const customers = new Set(
      sales
        .map((sale) => sale.customerName?.trim().toLowerCase())
        .filter(Boolean)
    );

    return customers.size;
  }, [sales]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredSales = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return sales;

    return sales.filter((sale) => {
      const customerMatch = sale.customerName
        ?.toLowerCase()
        .includes(value);

      const productMatch = (sale.products || []).some((item) =>
        item.product?.name?.toLowerCase().includes(value)
      );

      return customerMatch || productMatch;
    });
  }, [sales, search]);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSales.length / salesPerPage)
  );

  const paginatedSales = useMemo(() => {
    const startIndex = (page - 1) * salesPerPage;
    return filteredSales.slice(startIndex, startIndex + salesPerPage);
  }, [filteredSales, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // --------------------------------------------------
  // Format Currency
  // --------------------------------------------------

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  // --------------------------------------------------
  // Format Date
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
  // Open Create Modal
  // --------------------------------------------------

  const handleAddSale = () => {
    setEditingSale(null);
    setCustomerName("");

    setSaleItems([
      {
        product: "",
        quantity: 1,
      },
    ]);

    setError("");
    setShowSaleModal(true);
  };

  // --------------------------------------------------
  // Open Edit Modal
  // --------------------------------------------------

  const handleEditSale = (sale) => {
    setEditingSale(sale);
    setCustomerName(sale.customerName || "");

    setSaleItems(
      (sale.products || []).map((item) => ({
        product:
          typeof item.product === "object"
            ? item.product._id
            : item.product,
        quantity: item.quantity,
      }))
    );

    setOpenActionId(null);
    setError("");
    setShowSaleModal(true);
  };

  // --------------------------------------------------
  // Close Modal
  // --------------------------------------------------

  const closeSaleModal = () => {
    if (saving) return;

    setShowSaleModal(false);
    setEditingSale(null);
    setCustomerName("");

    setSaleItems([
      {
        product: "",
        quantity: 1,
      },
    ]);
  };

  // --------------------------------------------------
  // Add Product Row
  // --------------------------------------------------

  const addProductRow = () => {
    setSaleItems((prev) => [
      ...prev,
      {
        product: "",
        quantity: 1,
      },
    ]);
  };

  // --------------------------------------------------
  // Remove Product Row
  // --------------------------------------------------

  const removeProductRow = (index) => {
    if (saleItems.length === 1) return;

    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  // --------------------------------------------------
  // Update Product Row
  // --------------------------------------------------

  const updateSaleItem = (index, field, value) => {
    setSaleItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // --------------------------------------------------
  // Get Product By ID
  // --------------------------------------------------

  const getProduct = (productId) => {
    return products.find((product) => product._id === productId);
  };

  // --------------------------------------------------
  // Calculate Total
  // --------------------------------------------------

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => {
      const product = getProduct(item.product);

      if (!product) return total;

      return total + Number(product.price || 0) * Number(item.quantity || 0);
    }, 0);
  };

  // --------------------------------------------------
  // Save Sale
  // --------------------------------------------------

  const handleSaveSale = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    const validItems = saleItems.filter(
      (item) => item.product && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    // Prevent selecting same product multiple times
    const productIds = validItems.map((item) => item.product);

    if (new Set(productIds).size !== productIds.length) {
      setError("Please select each product only once.");
      return;
    }

    // Validate stock
    for (const item of validItems) {
      const product = getProduct(item.product);

      if (!product) {
        setError("Selected product could not be found.");
        return;
      }

      /*
        When editing, the backend restores the old sale stock first.
        Therefore the frontend only needs to validate the currently
        displayed product quantity approximately.
      */
      if (!editingSale && Number(item.quantity) > Number(product.quantity)) {
        setError(
          `Insufficient stock for ${product.name}. Available stock: ${product.quantity}`
        );
        return;
      }
    }

    const payload = {
      customerName: customerName.trim(),
      products: validItems.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity),
      })),
    };

    try {
      setSaving(true);
      setError("");

      let response;

      if (editingSale) {
        response = await api.put(`/sales/${editingSale._id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await api.post("/sales", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (response.data?.success) {
        closeSaleModal();
        await fetchSales();
        await fetchProducts();
      } else {
        setError(
          response.data?.message ||
            `Failed to ${editingSale ? "update" : "create"} sale.`
        );
      }
    } catch (err) {
      console.error("Error saving sale:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          `Failed to ${editingSale ? "update" : "create"} sale.`
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Delete Sale
  // --------------------------------------------------

  const handleDeleteSale = async () => {
    if (!deleteSale) return;

    try {
      setSaving(true);
      setError("");

      const response = await api.delete(`/sales/${deleteSale._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setDeleteSale(null);
        await fetchSales();
        await fetchProducts();
      } else {
        setError(
          response.data?.message ||
            "Failed to delete sale."
        );
      }
    } catch (err) {
      console.error("Error deleting sale:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to delete sale."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Product Names
  // --------------------------------------------------

  const getProductNames = (sale) => {
    if (!sale.products || sale.products.length === 0) {
      return "-";
    }

    return sale.products
      .map((item) => item.product?.name || "Unknown Product")
      .join(", ");
  };

  // --------------------------------------------------
  // Total Quantity
  // --------------------------------------------------

  const getSaleQuantity = (sale) => {
    return (sale.products || []).reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="dashboard-container">
      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <i className="fa-solid fa-wallet"></i>
          </div>

          <span>LedgerFlow</span>
        </div>

        <nav className="dashboard-navigation">
          <Link to="/dashboard" className="dashboard-nav-item">
            <i className="fa-solid fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>

          <Link to="/products" className="dashboard-nav-item">
            <i className="fa-solid fa-box"></i>
            <span>Products</span>
          </Link>

          <Link to="/sales" className="dashboard-nav-item active">
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Sales</span>
          </Link>
           <Link to="/customers" className="dashboard-nav-item">
              <i className="fa-solid fa-users"></i>
              <span>Customers</span>
            </Link>
          <Link to="/purchases" className="dashboard-nav-item">
            <i className="fa-solid fa-bag-shopping"></i>
            <span>Purchases</span>
          </Link>

          <Link to="/suppliers" className="dashboard-nav-item">
            <i className="fa-solid fa-truck"></i>
            <span>Suppliers</span>
          </Link>

          <Link to="/invoices" className="dashboard-nav-item">
            <i className="fa-solid fa-file-invoice"></i>
            <span>Invoices</span>
          </Link>

          <Link to="/expenses" className="dashboard-nav-item">
            <i className="fa-solid fa-receipt"></i>
            <span>Expenses</span>
          </Link>

          <Link to="/reports" className="dashboard-nav-item">
            <i className="fa-solid fa-chart-pie"></i>
            <span>Reports</span>
          </Link>

          <Link to="/settings" className="dashboard-nav-item">
            <i className="fa-solid fa-gear"></i>
             <span>Settings</span>
            </Link>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <button
            className="dashboard-logout"
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

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="dashboard-main sales-main">
        {/* Page Header */}

        <div className="sales-page-header">
          <div>
            <div className="sales-breadcrumb">
              <Link to="/dashboard" className="sales-breadcrumb-link">
                Dashboard
              </Link>

              <i className="fa-solid fa-chevron-right"></i>

              <span>Sales</span>
            </div>

            <h1>Sales</h1>

            <p>
              Track customer sales, revenue, products sold, and transactions.
            </p>
          </div>

          <button
            className="sales-primary-btn sales-add-btn"
            onClick={handleAddSale}
          >
            <i className="fa-solid fa-plus"></i>
            New Sale
          </button>
        </div>

        {/* Error */}

        {error && !showSaleModal && (
          <div className="sales-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="sales-summary-grid">
          <div className="sales-summary-card">
            <div className="sales-summary-icon">
              <i className="fa-solid fa-receipt"></i>
            </div>

            <div>
              <span>Total Sales</span>
              <strong>{sales.length}</strong>
            </div>
          </div>

          <div className="sales-summary-card">
            <div className="sales-summary-icon revenue">
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>

            <div>
              <span>Total Revenue</span>
              <strong>{formatCurrency(totalRevenue)}</strong>
            </div>
          </div>

          <div className="sales-summary-card">
            <div className="sales-summary-icon customers">
              <i className="fa-solid fa-users"></i>
            </div>

            <div>
              <span>Customers</span>
              <strong>{totalCustomers}</strong>
            </div>
          </div>

          <div className="sales-summary-card">
            <div className="sales-summary-icon items">
              <i className="fa-solid fa-box-open"></i>
            </div>

            <div>
              <span>Items Sold</span>
              <strong>{totalItemsSold}</strong>
            </div>
          </div>
        </div>

        {/* ==================================================
            SALES TABLE CARD
        ================================================== */}

        <div className="sales-table-card">
          <div className="sales-table-header">
            <div>
              <h2>Sales Transactions</h2>
              <p>View and manage all your sales.</p>
            </div>

            <div className="sales-search-box">
              <i className="fa-solid fa-magnifying-glass"></i>

              <input
                type="text"
                placeholder="Search customer or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="sales-search-clear"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
          </div>

          <div className="sales-table-wrapper">
            {loading ? (
              <div className="sales-table-state">
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Loading sales...</span>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="sales-table-state">
                <div className="sales-empty-icon">
                  <i className="fa-solid fa-cart-shopping"></i>
                </div>

                <h3>
                  {search ? "No sales found" : "No sales yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different customer or product name."
                    : "Create your first sale to see it here."}
                </p>

                {!search && (
                  <button
                    className="sales-primary-btn"
                    onClick={handleAddSale}
                  >
                    <i className="fa-solid fa-plus"></i>
                    Create Sale
                  </button>
                )}
              </div>
            ) : (
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th className="sales-actions-column">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedSales.map((sale) => (
                    <tr key={sale._id}>
                      <td>
                        <div className="sales-customer-cell">
                          <div className="sales-customer-avatar">
                            {sale.customerName
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>

                          <div>
                            <strong>{sale.customerName}</strong>
                            <span>
                              #{sale._id?.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="sales-product-cell">
                          <span>
                            {getProductNames(sale)}
                          </span>

                          {sale.products?.length > 1 && (
                            <small>
                              {sale.products.length} products
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="sales-quantity-badge">
                          {getSaleQuantity(sale)}
                        </span>
                      </td>

                      <td>
                        <strong className="sales-total">
                          {formatCurrency(sale.totalAmount)}
                        </strong>
                      </td>

                      <td>
                        <span className="sales-date">
                          {formatDate(sale.createdAt)}
                        </span>
                      </td>

                      <td className="sales-actions-column">
                        <div className="sales-actions-wrapper">
                          <button
                            className="sales-action-btn"
                            onClick={() =>
                              setOpenActionId(
                                openActionId === sale._id
                                  ? null
                                  : sale._id
                              )
                            }
                          >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                          </button>

                          {openActionId === sale._id && (
                            <div className="sales-action-menu">
                              <button
                                onClick={() => handleEditSale(sale)}
                              >
                                <i className="fa-solid fa-pen"></i>
                                Edit
                              </button>

                              <button
                                className="delete-action"
                                onClick={() => {
                                  setDeleteSale(sale);
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
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredSales.length > 0 && (
            <div className="sales-table-footer">
              <span>
                Showing{" "}
                <strong>
                  {(page - 1) * salesPerPage + 1}-
                  {Math.min(page * salesPerPage, filteredSales.length)}
                </strong>{" "}
                of <strong>{filteredSales.length}</strong> sales
              </span>
            </div>
          )}

          {!loading && filteredSales.length > 0 && (
            <div className="sales-pagination">
              <button
                type="button"
                className="sales-pagination-btn"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                <i className="fa-solid fa-chevron-left"></i>
                Previous
              </button>

              <div className="sales-pagination-pages">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`sales-pagination-page ${
                        page === pageNumber ? "active" : ""
                      }`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="sales-pagination-btn"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
              >
                Next
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ==================================================
          CREATE / EDIT SALE MODAL
      ================================================== */}

      {showSaleModal && (
        <div
          className="sales-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeSaleModal();
            }
          }}
        >
          <div className="sales-modal">
            <div className="sales-modal-header">
              <div>
                <h2>
                  {editingSale ? "Edit Sale" : "Create New Sale"}
                </h2>

                <p>
                  {editingSale
                    ? "Update the customer and products in this sale."
                    : "Add customer and product details to create a sale."}
                </p>
              </div>

              <button
                className="sales-modal-close"
                onClick={closeSaleModal}
                disabled={saving}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveSale}>
              <div className="sales-modal-body">
                {error && (
                  <div className="sales-modal-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                  </div>
                )}

                {/* Customer */}

                <div className="sales-form-group">
                  <label>
                    Customer Name <span>*</span>
                  </label>

                  <div className="sales-input-wrapper">
                    <i className="fa-solid fa-user"></i>

                    <input
                      type="text"
                      placeholder="Enter customer name"
                      value={customerName}
                      onChange={(e) =>
                        setCustomerName(e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Products */}

                <div className="sales-products-section">
                  <div className="sales-products-section-header">
                    <div>
                      <h3>Products</h3>
                      <p>Add one or more products to this sale.</p>
                    </div>

                    <button
                      type="button"
                      className="sales-add-product-btn"
                      onClick={addProductRow}
                    >
                      <i className="fa-solid fa-plus"></i>
                      Add Product
                    </button>
                  </div>

                  <div className="sales-product-rows">
                    {saleItems.map((item, index) => {
                      const selectedProduct = getProduct(item.product);

                      const subtotal = selectedProduct
                        ? Number(selectedProduct.price || 0) *
                          Number(item.quantity || 0)
                        : 0;

                      return (
                        <div
                          className="sales-product-row"
                          key={`${index}-${item.product}`}
                        >
                          <div className="sales-product-number">
                            {index + 1}
                          </div>

                          <div className="sales-product-field product-select-field">
                            <label>Product</label>

                            <select
                              value={item.product}
                              onChange={(e) =>
                                updateSaleItem(
                                  index,
                                  "product",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">
                                Select product
                              </option>

                              {products.map((product) => {
                                const alreadySelected =
                                  saleItems.some(
                                    (saleItem, saleIndex) =>
                                      saleIndex !== index &&
                                      saleItem.product === product._id
                                  );

                                return (
                                  <option
                                    key={product._id}
                                    value={product._id}
                                    disabled={alreadySelected}
                                  >
                                    {product.name} — ₹
                                    {Number(
                                      product.price || 0
                                    ).toLocaleString("en-IN")}{" "}
                                    | Stock: {product.quantity}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <div className="sales-product-field quantity-field">
                            <label>Quantity</label>

                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateSaleItem(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="sales-product-subtotal">
                            <label>Subtotal</label>
                            <strong>
                              {formatCurrency(subtotal)}
                            </strong>
                          </div>

                          {saleItems.length > 1 && (
                            <button
                              type="button"
                              className="sales-remove-product-btn"
                              onClick={() =>
                                removeProductRow(index)
                              }
                              title="Remove product"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total */}

                <div className="sales-total-box">
                  <div>
                    <span>Total Amount</span>
                    <small>
                      {saleItems.length} product{" "}
                      {saleItems.length === 1 ? "item" : "items"}
                    </small>
                  </div>

                  <strong>
                    {formatCurrency(calculateTotal())}
                  </strong>
                </div>
              </div>

              <div className="sales-modal-footer">
                <button
                  type="button"
                  className="sales-secondary-btn"
                  onClick={closeSaleModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sales-primary-btn"
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
                      {editingSale
                        ? "Update Sale"
                        : "Create Sale"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          DELETE CONFIRMATION MODAL
      ================================================== */}

      {deleteSale && (
        <div
          className="sales-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setDeleteSale(null);
            }
          }}
        >
          <div className="sales-delete-modal">
            <div className="sales-delete-icon">
              <i className="fa-solid fa-trash"></i>
            </div>

            <h2>Delete Sale?</h2>

            <p>
              Are you sure you want to delete the sale for{" "}
              <strong>{deleteSale.customerName}</strong>?
              <br />
              The sold stock will be restored automatically.
            </p>

            <div className="sales-delete-actions">
              <button
                className="sales-secondary-btn"
                onClick={() => setDeleteSale(null)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="sales-danger-btn"
                onClick={handleDeleteSale}
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
                    Delete Sale
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

export default Sales;