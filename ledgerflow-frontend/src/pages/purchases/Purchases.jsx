import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./purchases.css";

const Purchases = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const purchasesPerPage = 10;

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);

  const [deletePurchase, setDeletePurchase] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);

  const [supplier, setSupplier] = useState("");

  const [purchaseItems, setPurchaseItems] = useState([
    {
      product: "",
      quantity: 1,
      costPrice: "",
    },
  ]);

  const [saving, setSaving] = useState(false);

  // --------------------------------------------------
  // Fetch Purchases
  // --------------------------------------------------

  const fetchPurchases = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/purchases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setPurchases(response.data.purchases || []);
      } else {
        setPurchases([]);
      }
    } catch (err) {
      console.error("Error fetching purchases:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load purchases. Please try again."
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

  // --------------------------------------------------
  // Fetch Suppliers
  // --------------------------------------------------

  const fetchSuppliers = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api.get("/suppliers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setSuppliers(response.data.suppliers || []);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  }, [token]);

  // --------------------------------------------------
  // Initial Fetch
  // --------------------------------------------------

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
    fetchSuppliers();
  }, [fetchPurchases, fetchProducts, fetchSuppliers]);

  // --------------------------------------------------
  // Summary Calculations
  // --------------------------------------------------

  const totalSpent = useMemo(() => {
    return purchases.reduce(
      (total, purchase) => total + Number(purchase.totalAmount || 0),
      0
    );
  }, [purchases]);

  const totalItemsPurchased = useMemo(() => {
    return purchases.reduce((total, purchase) => {
      return (
        total +
        (purchase.products || []).reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )
      );
    }, 0);
  }, [purchases]);

  const totalSuppliers = useMemo(() => {
    const supplierIds = new Set(
      purchases
        .map((purchase) =>
          typeof purchase.supplier === "object"
            ? purchase.supplier?._id
            : purchase.supplier
        )
        .filter(Boolean)
    );

    return supplierIds.size;
  }, [purchases]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredPurchases = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return purchases;

    return purchases.filter((purchase) => {
      const supplierName =
        typeof purchase.supplier === "object"
          ? purchase.supplier?.name
          : "";

      const supplierMatch = supplierName
        ?.toLowerCase()
        .includes(value);

      const productMatch = (purchase.products || []).some((item) =>
        item.product?.name?.toLowerCase().includes(value)
      );

      const skuMatch = (purchase.products || []).some((item) =>
        item.product?.sku?.toLowerCase().includes(value)
      );

      return supplierMatch || productMatch || skuMatch;
    });
  }, [purchases, search]);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPurchases.length / purchasesPerPage)
  );

  const paginatedPurchases = useMemo(() => {
    const startIndex = (page - 1) * purchasesPerPage;
    return filteredPurchases.slice(
      startIndex,
      startIndex + purchasesPerPage
    );
  }, [filteredPurchases, page]);

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
  // Supplier Name
  // --------------------------------------------------

  const getSupplierName = (purchase) => {
    if (!purchase.supplier) return "Unknown Supplier";

    if (typeof purchase.supplier === "object") {
      return purchase.supplier.name || "Unknown Supplier";
    }

    const foundSupplier = suppliers.find(
      (item) => item._id === purchase.supplier
    );

    return foundSupplier?.name || "Unknown Supplier";
  };

  // --------------------------------------------------
  // Product Names
  // --------------------------------------------------

  const getProductNames = (purchase) => {
    if (!purchase.products || purchase.products.length === 0) {
      return "-";
    }

    return purchase.products
      .map((item) => item.product?.name || "Unknown Product")
      .join(", ");
  };

  // --------------------------------------------------
  // Total Quantity
  // --------------------------------------------------

  const getPurchaseQuantity = (purchase) => {
    return (purchase.products || []).reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  };

  // --------------------------------------------------
  // Open Create Modal
  // --------------------------------------------------

  const handleAddPurchase = () => {
    setEditingPurchase(null);
    setSupplier("");

    setPurchaseItems([
      {
        product: "",
        quantity: 1,
        costPrice: "",
      },
    ]);

    setError("");
    setShowPurchaseModal(true);
  };

  // --------------------------------------------------
  // Open Edit Modal
  // --------------------------------------------------

  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);

    setSupplier(
      typeof purchase.supplier === "object"
        ? purchase.supplier?._id
        : purchase.supplier || ""
    );

    setPurchaseItems(
      (purchase.products || []).map((item) => ({
        product:
          typeof item.product === "object"
            ? item.product._id
            : item.product,
        quantity: item.quantity,
        costPrice: item.costPrice,
      }))
    );

    setOpenActionId(null);
    setError("");
    setShowPurchaseModal(true);
  };

  // --------------------------------------------------
  // Close Modal
  // --------------------------------------------------

  const closePurchaseModal = () => {
    if (saving) return;

    setShowPurchaseModal(false);
    setEditingPurchase(null);
    setSupplier("");

    setPurchaseItems([
      {
        product: "",
        quantity: 1,
        costPrice: "",
      },
    ]);
  };

  // --------------------------------------------------
  // Add Product Row
  // --------------------------------------------------

  const addProductRow = () => {
    setPurchaseItems((prev) => [
      ...prev,
      {
        product: "",
        quantity: 1,
        costPrice: "",
      },
    ]);
  };

  // --------------------------------------------------
  // Remove Product Row
  // --------------------------------------------------

  const removeProductRow = (index) => {
    if (purchaseItems.length === 1) return;

    setPurchaseItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // --------------------------------------------------
  // Update Product Row
  // --------------------------------------------------

  const updatePurchaseItem = (index, field, value) => {
    setPurchaseItems((prev) =>
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
  // Get Product
  // --------------------------------------------------

  const getProduct = (productId) => {
    return products.find((product) => product._id === productId);
  };

  // --------------------------------------------------
  // Calculate Total
  // --------------------------------------------------

  const calculateTotal = () => {
    return purchaseItems.reduce((total, item) => {
      const quantity = Number(item.quantity || 0);
      const costPrice = Number(item.costPrice || 0);

      return total + quantity * costPrice;
    }, 0);
  };

  // --------------------------------------------------
  // Save Purchase
  // --------------------------------------------------

  const handleSavePurchase = async (e) => {
    e.preventDefault();

    if (!supplier) {
      setError("Supplier is required.");
      return;
    }

    const validItems = purchaseItems.filter(
      (item) =>
        item.product &&
        Number(item.quantity) > 0 &&
        item.costPrice !== "" &&
        Number(item.costPrice) >= 0
    );

    if (validItems.length === 0) {
      setError("Please add at least one valid product.");
      return;
    }

    // Prevent duplicate products
    const productIds = validItems.map((item) => item.product);

    if (new Set(productIds).size !== productIds.length) {
      setError("Please select each product only once.");
      return;
    }

    // Validate selected products
    for (const item of validItems) {
      const product = getProduct(item.product);

      if (!product) {
        setError("Selected product could not be found.");
        return;
      }

      if (Number(item.quantity) <= 0) {
        setError(`Quantity for ${product.name} must be greater than 0.`);
        return;
      }

      if (Number(item.costPrice) < 0) {
        setError(`Cost price for ${product.name} cannot be negative.`);
        return;
      }
    }

    const payload = {
      supplier,
      products: validItems.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity),
        costPrice: Number(item.costPrice),
      })),
    };

    try {
      setSaving(true);
      setError("");

      let response;

      if (editingPurchase) {
        response = await api.put(
          `/purchases/${editingPurchase._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await api.post("/purchases", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (response.data?.success) {
        closePurchaseModal();

        await fetchPurchases();
        await fetchProducts();
      } else {
        setError(
          response.data?.message ||
            `Failed to ${
              editingPurchase ? "update" : "create"
            } purchase.`
        );
      }
    } catch (err) {
      console.error("Error saving purchase:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          `Failed to ${
            editingPurchase ? "update" : "create"
          } purchase.`
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Delete Purchase
  // --------------------------------------------------

  const handleDeletePurchase = async () => {
    if (!deletePurchase) return;

    try {
      setSaving(true);
      setError("");

      const response = await api.delete(
        `/purchases/${deletePurchase._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setDeletePurchase(null);

        await fetchPurchases();
        await fetchProducts();
      } else {
        setError(
          response.data?.message ||
            "Failed to delete purchase."
        );
      }
    } catch (err) {
      console.error("Error deleting purchase:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to delete purchase."
      );
    } finally {
      setSaving(false);
    }
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

          <Link
            to="/dashboard"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-chart-line"></i>
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
            to="/customers"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-users"></i>
            <span>Customers</span>
          </Link>

          <Link
            to="/purchases"
            className="dashboard-nav-item active"
          >
            <i className="fa-solid fa-bag-shopping"></i>
            <span>Purchases</span>
          </Link>

          <Link
            to="/suppliers"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-truck"></i>
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
            <i className="fa-solid fa-receipt"></i>
            <span>Expenses</span>
          </Link>

          <Link
            to="/reports"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-chart-pie"></i>
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

      <main className="dashboard-main purchases-main">

        {/* Page Header */}

        <div className="purchases-page-header">

          <div>
            <div className="purchases-breadcrumb">

              <Link
                to="/dashboard"
                className="purchases-breadcrumb-link"
              >
                Dashboard
              </Link>

              <i className="fa-solid fa-chevron-right"></i>

              <span>Purchases</span>

            </div>

            <h1>Purchases</h1>

            <p>
              Track supplier purchases, inventory additions,
              costs, and transactions.
            </p>
          </div>

          <button
            className="purchases-primary-btn purchases-add-btn"
            onClick={handleAddPurchase}
          >
            <i className="fa-solid fa-plus"></i>
            New Purchase
          </button>

        </div>

        {/* Error */}

        {error && !showPurchaseModal && (
          <div className="purchases-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="purchases-summary-grid">

          <div className="purchases-summary-card">
            <div className="purchases-summary-icon">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>

            <div>
              <span>Total Purchases</span>
              <strong>{purchases.length}</strong>
            </div>
          </div>

          <div className="purchases-summary-card">

            <div className="purchases-summary-icon spent">
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>

            <div>
              <span>Total Spent</span>
              <strong>{formatCurrency(totalSpent)}</strong>
            </div>

          </div>

          <div className="purchases-summary-card">

            <div className="purchases-summary-icon items">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>

            <div>
              <span>Items Purchased</span>
              <strong>{totalItemsPurchased}</strong>
            </div>

          </div>

          <div className="purchases-summary-card">

            <div className="purchases-summary-icon suppliers">
              <i className="fa-solid fa-truck"></i>
            </div>

            <div>
              <span>Suppliers</span>
              <strong>{totalSuppliers}</strong>
            </div>

          </div>

        </div>

        {/* ==================================================
            PURCHASE TABLE
        ================================================== */}

        <div className="purchases-table-card">

          <div className="purchases-table-header">

            <div>
              <h2>Purchase Transactions</h2>

              <p>
                View and manage your purchase history.
              </p>
            </div>

            <div className="purchases-search-box">

              <i className="fa-solid fa-magnifying-glass"></i>

              <input
                type="text"
                placeholder="Search supplier or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="purchases-search-clear"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}

            </div>

          </div>

          <div className="purchases-table-wrapper">

            {loading ? (
              <div className="purchases-state">

                <i className="fa-solid fa-spinner fa-spin"></i>

                <h3>Loading purchases...</h3>

                <p>
                  Please wait while your purchase history is
                  loaded.
                </p>

              </div>
            ) : filteredPurchases.length === 0 ? (

              <div className="purchases-state">

                <div className="purchases-empty-icon">
                  <i className="fa-solid fa-bag-shopping"></i>
                </div>

                <h3>
                  {search
                    ? "No purchases found"
                    : "No purchases yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different supplier or product name."
                    : "Create your first purchase to see it here."}
                </p>

                {!search && (
                  <button
                    className="purchases-primary-btn"
                    onClick={handleAddPurchase}
                  >
                    <i className="fa-solid fa-plus"></i>
                    Create Purchase
                  </button>
                )}

              </div>

            ) : (

              <table className="purchases-table">

                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Products</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th className="purchases-actions-column">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {paginatedPurchases.map((purchase) => (

                    <tr key={purchase._id}>

                      {/* Supplier */}

                      <td>

                        <div className="purchases-supplier-cell">

                          <div className="purchases-supplier-avatar">
                            {getSupplierName(purchase)
                              ?.charAt(0)
                              ?.toUpperCase() || "S"}
                          </div>

                          <div>

                            <strong>
                              {getSupplierName(purchase)}
                            </strong>

                            <span>
                              #
                              {purchase._id
                                ?.slice(-6)
                                .toUpperCase()}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* Products */}

                      <td>

                        <div className="purchases-product-cell">

                          <span>
                            {getProductNames(purchase)}
                          </span>

                          {purchase.products?.length > 1 && (
                            <small>
                              {purchase.products.length} products
                            </small>
                          )}

                        </div>

                      </td>

                      {/* Quantity */}

                      <td>

                        <span className="purchases-quantity-badge">
                          {getPurchaseQuantity(purchase)}
                        </span>

                      </td>

                      {/* Total */}

                      <td>

                        <strong className="purchases-total">
                          {formatCurrency(
                            purchase.totalAmount
                          )}
                        </strong>

                      </td>

                      {/* Date */}

                      <td>

                        <span className="purchases-date">
                          {formatDate(purchase.createdAt)}
                        </span>

                      </td>

                      {/* Actions */}

                      <td className="purchases-actions-column">

                        <div className="purchases-actions-wrapper">

                          <button
                            className="purchases-action-btn"
                            onClick={() =>
                              setOpenActionId(
                                openActionId === purchase._id
                                  ? null
                                  : purchase._id
                              )
                            }
                          >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                          </button>

                          {openActionId === purchase._id && (

                            <div className="purchases-action-menu">

                              <button
                                onClick={() =>
                                  handleEditPurchase(purchase)
                                }
                              >
                                <i className="fa-solid fa-pen"></i>
                                Edit
                              </button>

                              <button
                                className="delete-action"
                                onClick={() => {
                                  setDeletePurchase(purchase);
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

          {!loading && filteredPurchases.length > 0 && (

            <div className="purchases-table-footer">

              <span>
                Showing{" "}
                <strong>
                  {(page - 1) * purchasesPerPage + 1}-
                  {Math.min(
                    page * purchasesPerPage,
                    filteredPurchases.length
                  )}
                </strong>{" "}
                of <strong>{filteredPurchases.length}</strong>{" "}
                purchases
              </span>

            </div>

          )}

          {!loading && filteredPurchases.length > 0 && (
            <div className="purchases-pagination">
              <button
                type="button"
                className="purchases-pagination-btn"
                onClick={() =>
                  setPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={page === 1}
              >
                <i className="fa-solid fa-chevron-left"></i>
                Previous
              </button>

              <div className="purchases-pagination-pages">
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`purchases-pagination-page ${
                      page === pageNumber ? "active" : ""
                    }`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="purchases-pagination-btn"
                onClick={() =>
                  setPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
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
          CREATE / EDIT PURCHASE MODAL
      ================================================== */}

      {showPurchaseModal && (

        <div
          className="purchases-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closePurchaseModal();
            }
          }}
        >

          <div className="purchases-modal">

            <div className="purchases-modal-header">

              <div>

                <h2>
                  {editingPurchase
                    ? "Edit Purchase"
                    : "Create New Purchase"}
                </h2>

                <p>
                  {editingPurchase
                    ? "Update supplier, products, quantity, and cost."
                    : "Add supplier and product details to create a purchase."}
                </p>

              </div>

              <button
                className="purchases-modal-close"
                onClick={closePurchaseModal}
                disabled={saving}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

            </div>

            {error && (
              <div className="purchases-modal-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSavePurchase}>

              <div className="purchases-modal-body">

                {/* Supplier */}

                <div className="purchases-field">

                  <label>
                    Supplier <span>*</span>
                  </label>

                  <select
                    value={supplier}
                    onChange={(e) =>
                      setSupplier(e.target.value)
                    }
                  >

                    <option value="">
                      Select supplier
                    </option>

                    {suppliers.map((item) => (

                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {item.name}
                        {item.phone
                          ? ` — ${item.phone}`
                          : ""}
                      </option>

                    ))}

                  </select>

                  {suppliers.length === 0 && (
                    <small className="purchases-field-hint">
                      No suppliers found. Add a supplier first.
                    </small>
                  )}

                </div>

                {/* Products */}

                <div className="purchases-products-section">

                  <div className="purchases-products-section-header">

                    <div>
                      <h3>Products</h3>

                      <p>
                        Add one or more products to this purchase.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="purchases-add-product-btn"
                      onClick={addProductRow}
                    >
                      <i className="fa-solid fa-plus"></i>
                      Add Product
                    </button>

                  </div>

                  <div className="purchases-product-rows">

                    {purchaseItems.map((item, index) => {

                      const selectedProduct =
                        getProduct(item.product);

                      const subtotal =
                        Number(item.quantity || 0) *
                        Number(item.costPrice || 0);

                      return (

                        <div
                          className="purchases-product-row"
                          key={`${index}-${item.product}`}
                        >

                          <div className="purchases-product-number">
                            {index + 1}
                          </div>

                          {/* Product */}

                          <div className="purchases-product-field product-select-field">

                            <label>Product</label>

                            <select
                              value={item.product}
                              onChange={(e) =>
                                updatePurchaseItem(
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
                                  purchaseItems.some(
                                    (purchaseItem, purchaseIndex) =>
                                      purchaseIndex !== index &&
                                      purchaseItem.product ===
                                        product._id
                                  );

                                return (

                                  <option
                                    key={product._id}
                                    value={product._id}
                                    disabled={alreadySelected}
                                  >
                                    {product.name} — Stock:{" "}
                                    {product.quantity}
                                  </option>

                                );
                              })}

                            </select>

                          </div>

                          {/* Quantity */}

                          <div className="purchases-product-field quantity-field">

                            <label>Quantity</label>

                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updatePurchaseItem(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                            />

                          </div>

                          {/* Cost Price */}

                          <div className="purchases-product-field cost-field">

                            <label>Cost Price</label>

                            <div className="purchases-price-input">

                              <span>₹</span>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={
                                  selectedProduct
                                    ? selectedProduct.costPrice
                                    : "0.00"
                                }
                                value={item.costPrice}
                                onChange={(e) =>
                                  updatePurchaseItem(
                                    index,
                                    "costPrice",
                                    e.target.value
                                  )
                                }
                              />

                            </div>

                          </div>

                          {/* Subtotal */}

                          <div className="purchases-product-subtotal">

                            <label>Subtotal</label>

                            <strong>
                              {formatCurrency(subtotal)}
                            </strong>

                          </div>

                          {/* Remove */}

                          {purchaseItems.length > 1 && (

                            <button
                              type="button"
                              className="purchases-remove-product-btn"
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

                <div className="purchases-total-box">

                  <div>

                    <span>Total Amount</span>

                    <small>
                      {purchaseItems.length} product{" "}
                      {purchaseItems.length === 1
                        ? "item"
                        : "items"}
                    </small>

                  </div>

                  <strong>
                    {formatCurrency(calculateTotal())}
                  </strong>

                </div>

              </div>

              <div className="purchases-modal-footer">

                <button
                  type="button"
                  className="purchases-secondary-btn"
                  onClick={closePurchaseModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="purchases-primary-btn"
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
                      {editingPurchase
                        ? "Update Purchase"
                        : "Create Purchase"}
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

      {deletePurchase && (

        <div
          className="purchases-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              setDeletePurchase(null);
            }
          }}
        >

          <div className="purchases-delete-modal">

            <div className="purchases-delete-icon">
              <i className="fa-solid fa-trash"></i>
            </div>

            <h2>Delete Purchase?</h2>

            <p>
              Are you sure you want to delete the purchase
              from{" "}
              <strong>
                {getSupplierName(deletePurchase)}
              </strong>
              ?
              <br />
              The purchased stock will be reduced
              automatically.
            </p>

            <div className="purchases-delete-actions">

              <button
                type="button"
                className="purchases-secondary-btn"
                onClick={() => setDeletePurchase(null)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="purchases-danger-btn"
                onClick={handleDeletePurchase}
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
                    Delete Purchase
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

export default Purchases;