import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./products.css";

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockAction, setStockAction] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");

  const [deleteProduct, setDeleteProduct] = useState(null);

  const [openActionId, setOpenActionId] = useState(null);

  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // Fetch Products
  // --------------------------------------------------
  const fetchProducts = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products", {
        params: {
          search: search.trim(),
          category,
          page,
          limit: 10,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setProducts(response.data.products || []);
        setTotalProducts(response.data.totalProducts || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching products:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token, page, search, category, navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // --------------------------------------------------
  // Category Filter
  // --------------------------------------------------
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  // --------------------------------------------------
  // Clear Filters
  // --------------------------------------------------
  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setPage(1);
  };

  // --------------------------------------------------
  // Product Modal
  // --------------------------------------------------
  const openAddProductModal = () => {
    setEditingProduct(null);
    setShowProductModal(true);
    setOpenActionId(null);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
    setOpenActionId(null);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
  };

  // --------------------------------------------------
  // Save Product
  // --------------------------------------------------
  const handleSaveProduct = async (formData) => {
    try {
      setError("");

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id || editingProduct.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await api.post("/products", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      closeProductModal();
      await fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to save product. Please try again."
      );
    }
  };

  // --------------------------------------------------
  // Stock Modal
  // --------------------------------------------------
  const openStockModal = (product, action) => {
    setStockProduct(product);
    setStockAction(action);
    setStockQuantity("");
    setShowStockModal(true);
    setOpenActionId(null);
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setStockProduct(null);
    setStockAction("");
    setStockQuantity("");
  };

  // --------------------------------------------------
  // Update Stock
  // --------------------------------------------------
  const handleStockUpdate = async (e) => {
    e.preventDefault();

    const quantity = Number(stockQuantity);

    if (!quantity || quantity <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return;
    }

    if (
      stockAction === "remove" &&
      quantity > Number(stockProduct?.quantity || 0)
    ) {
      setError("Cannot remove more stock than the available quantity.");
      return;
    }

    try {
      setError("");

      const productId = stockProduct._id || stockProduct.id;

      if (stockAction === "add") {
        await api.post(
          `/products/${productId}/stock`,
          {
            quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await api.delete(`/products/${productId}/stock`, {
          data: {
            quantity,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      closeStockModal();
      await fetchProducts();
    } catch (err) {
      console.error("Error updating stock:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to update stock. Please try again."
      );
    }
  };

  // --------------------------------------------------
  // Delete Product
  // --------------------------------------------------
  const openDeleteModal = (product) => {
    setDeleteProduct(product);
    setOpenActionId(null);
  };

  const closeDeleteModal = () => {
    setDeleteProduct(null);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;

    try {
      setError("");

      const productId = deleteProduct._id || deleteProduct.id;

      await api.delete(`/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      closeDeleteModal();

      // If deleting the last item on a page, move to previous page.
      if (products.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      console.error("Error deleting product:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to delete product. Please try again."
      );
    }
  };

  // --------------------------------------------------
  // Product Status
  // --------------------------------------------------
  const getProductStatus = (product) => {
    const quantity = Number(product.quantity || 0);
    const threshold = Number(product.lowStockThreshold || 10);

    if (quantity <= 0) {
      return {
        label: "Out of Stock",
        className: "out-of-stock",
        icon: "fa-solid fa-circle-xmark",
      };
    }

    if (quantity <= threshold) {
      return {
        label: "Low Stock",
        className: "low-stock",
        icon: "fa-solid fa-triangle-exclamation",
      };
    }

    return {
      label: "In Stock",
      className: "in-stock",
      icon: "fa-solid fa-circle-check",
    };
  };

  // --------------------------------------------------
  // Get Categories
  // --------------------------------------------------
  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter((item) => item && item.trim() !== "")
    ),
  ];

  const lowStockCount = products.filter((product) => {
    const quantity = Number(product.quantity || 0);
    const threshold = Number(product.lowStockThreshold || 10);

    return quantity > 0 && quantity <= threshold;
  }).length;

  const outOfStockCount = products.filter(
    (product) => Number(product.quantity || 0) <= 0
  ).length;

  // --------------------------------------------------
  // Product Form Modal
  // --------------------------------------------------
  const ProductModal = () => {
    const [formData, setFormData] = useState({
      name: editingProduct?.name || "",
      sku: editingProduct?.sku || "",
      category: editingProduct?.category || "",
      price: editingProduct?.price ?? "",
      costPrice: editingProduct?.costPrice ?? "",
      quantity: editingProduct?.quantity ?? 0,
      lowStockThreshold: editingProduct?.lowStockThreshold ?? 10,
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
        !formData.name.trim() ||
        !formData.sku.trim() ||
        !formData.category.trim()
      ) {
        setFormError("Please fill all required fields.");
        return;
      }

      if (Number(formData.price) < 0 || Number(formData.costPrice) < 0) {
        setFormError("Price values cannot be negative.");
        return;
      }

      if (Number(formData.quantity) < 0) {
        setFormError("Quantity cannot be negative.");
        return;
      }

      if (Number(formData.lowStockThreshold) < 0) {
        setFormError("Low stock threshold cannot be negative.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        quantity: Number(formData.quantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
      };

      await handleSaveProduct(payload);
    };

    return (
      <div className="products-modal-overlay">
        <div className="products-modal">
          <div className="products-modal-header">
            <div>
              <h2>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <p>
                {editingProduct
                  ? "Update product information"
                  : "Add a new product to your inventory"}
              </p>
            </div>

            <button
              type="button"
              className="products-modal-close"
              onClick={closeProductModal}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="products-form-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{formError}</span>
              </div>
            )}

            <div className="products-form-grid">
              <div className="products-form-group products-full-width">
                <label>
                  Product Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="products-form-group">
                <label>
                  SKU <span>*</span>
                </label>

                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. PROD-001"
                  required
                />
              </div>

              <div className="products-form-group">
                <label>
                  Category <span>*</span>
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  required
                />
              </div>

              <div className="products-form-group">
                <label>
                  Selling Price <span>*</span>
                </label>

                <div className="products-input-with-icon">
                  <span>₹</span>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="products-form-group">
                <label>
                  Cost Price <span>*</span>
                </label>

                <div className="products-input-with-icon">
                  <span>₹</span>

                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="products-form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="products-form-group">
                <label>Low Stock Threshold</label>

                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  min="0"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="products-modal-footer">
              <button
                type="button"
                className="products-secondary-btn"
                onClick={closeProductModal}
              >
                Cancel
              </button>

              <button type="submit" className="products-primary-btn">
                <i className="fa-solid fa-check"></i>
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // Stock Modal
  // --------------------------------------------------
  const StockModal = () => {
    if (!stockProduct) return null;

    return (
      <div className="products-modal-overlay">
        <div className="products-modal products-stock-modal">
          <div className="products-modal-header">
            <div>
              <h2>
                {stockAction === "add"
                  ? "Add Stock"
                  : "Remove Stock"}
              </h2>

              <p>{stockProduct.name}</p>
            </div>

            <button
              type="button"
              className="products-modal-close"
              onClick={closeStockModal}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleStockUpdate}>
            <div className="products-stock-info">
              <div>
                <span>Current Stock</span>
                <strong>{stockProduct.quantity || 0}</strong>
              </div>

              <div>
                <span>SKU</span>
                <strong>{stockProduct.sku}</strong>
              </div>
            </div>

            <div className="products-form-group">
              <label>
                Quantity <span>*</span>
              </label>

              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                min="1"
                placeholder="Enter quantity"
                autoFocus
                required
              />
            </div>

            <div className="products-modal-footer">
              <button
                type="button"
                className="products-secondary-btn"
                onClick={closeStockModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={
                  stockAction === "add"
                    ? "products-primary-btn"
                    : "products-danger-btn"
                }
              >
                <i
                  className={
                    stockAction === "add"
                      ? "fa-solid fa-plus"
                      : "fa-solid fa-minus"
                  }
                ></i>

                {stockAction === "add"
                  ? "Add Stock"
                  : "Remove Stock"}
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
    if (!deleteProduct) return null;

    return (
      <div className="products-modal-overlay">
        <div className="products-delete-modal">
          <div className="products-delete-icon">
            <i className="fa-solid fa-trash"></i>
          </div>

          <h2>Delete Product?</h2>

          <p>
            Are you sure you want to delete{" "}
            <strong>{deleteProduct.name}</strong>? This action
            cannot be undone.
          </p>

          <div className="products-delete-actions">
            <button
              type="button"
              className="products-secondary-btn"
              onClick={closeDeleteModal}
            >
              Cancel
            </button>

            <button
              type="button"
              className="products-danger-btn"
              onClick={handleDeleteProduct}
            >
              <i className="fa-solid fa-trash"></i>
              Delete Product
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <i className="fa-solid fa-layer-group"></i>
          </div>

          <span>LedgerFlow</span>
        </div>

        <nav className="dashboard-navigation">
          <Link to="/dashboard" className="dashboard-nav-item">
            <i className="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/products"
            className="dashboard-nav-item active"
          >
            <i className="fa-solid fa-box"></i>
            <span>Products</span>
          </Link>

          <Link to="/sales" className="dashboard-nav-item">
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Sales</span>
          </Link>

          <Link to="/purchases" className="dashboard-nav-item">
            <i className="fa-solid fa-truck"></i>
            <span>Purchases</span>
          </Link>

          <Link to="/customers" className="dashboard-nav-item">
            <i className="fa-solid fa-users"></i>
            <span>Customers</span>
          </Link>

          <Link to="/suppliers" className="dashboard-nav-item">
            <i className="fa-solid fa-boxes-stacked"></i>
            <span>Suppliers</span>
          </Link>

          <Link to="/invoices" className="dashboard-nav-item">
            <i className="fa-solid fa-file-invoice"></i>
            <span>Invoices</span>
          </Link>

          <Link to="/expenses" className="dashboard-nav-item">
            <i className="fa-solid fa-wallet"></i>
            <span>Expenses</span>
          </Link>

          <Link to="/reports" className="dashboard-nav-item">
            <i className="fa-solid fa-chart-column"></i>
            <span>Reports</span>
          </Link>

          <Link to="/settings" className="dashboard-nav-item">
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
      <main className="dashboard-main products-main">
        <div className="products-page-header">
          <div>
            <div className="products-breadcrumb">
  <Link to="/dashboard" className="products-breadcrumb-link">
    Dashboard
  </Link>

  <i className="fa-solid fa-chevron-right"></i>

  <strong>Products</strong>
</div>

            <h1>Products</h1>

            <p>
              Manage your products, inventory and stock levels.
            </p>
          </div>

          <button
            type="button"
            className="products-primary-btn products-add-btn"
            onClick={openAddProductModal}
          >
            <i className="fa-solid fa-plus"></i>
            Add Product
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="products-error">
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
        <div className="products-summary-grid">
          <div className="products-summary-card">
            <div className="products-summary-icon">
              <i className="fa-solid fa-box"></i>
            </div>

            <div>
              <span>Total Products</span>
              <strong>{totalProducts}</strong>
            </div>
          </div>

          <div className="products-summary-card">
            <div className="products-summary-icon">
              <i className="fa-solid fa-layer-group"></i>
            </div>

            <div>
              <span>Current Page</span>
              <strong>
                {page} / {totalPages}
              </strong>
            </div>
          </div>

          <div className="products-summary-card">
            <div className="products-summary-icon warning">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            <div>
              <span>Low Stock</span>
              <strong>{lowStockCount}</strong>
            </div>
          </div>

          <div className="products-summary-card">
            <div className="products-summary-icon danger">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>

            <div>
              <span>Out of Stock</span>
              <strong>{outOfStockCount}</strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="products-filter-panel">
          <div className="products-search-box">
            <i className="fa-solid fa-magnifying-glass"></i>

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by product name or SKU..."
            />
          </div>

          <div className="products-category-filter">
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
              className="products-clear-btn"
              onClick={handleClearFilters}
            >
              <i className="fa-solid fa-rotate-left"></i>
              Clear
            </button>
          )}
        </div>

        {/* Products Table */}
        <div className="products-table-card">
          <div className="products-table-header">
            <div>
              <h2>Product Inventory</h2>
              <p>
                {totalProducts}{" "}
                {totalProducts === 1 ? "product" : "products"} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="products-loading">
              <div className="products-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="products-empty">
              <div className="products-empty-icon">
                <i className="fa-solid fa-box-open"></i>
              </div>

              <h3>No Products Found</h3>

              <p>
                {search || category
                  ? "Try changing your search or filter."
                  : "Start by adding your first product."}
              </p>

              {!search && !category && (
                <button
                  type="button"
                  className="products-primary-btn"
                  onClick={openAddProductModal}
                >
                  <i className="fa-solid fa-plus"></i>
                  Add Product
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="products-table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Cost Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => {
                      const status = getProductStatus(product);
                      const productId =
                        product._id || product.id;

                      return (
                        <tr key={productId}>
                          <td>
                            <div className="products-name-cell">
                              <div className="products-table-product-icon">
                                <i className="fa-solid fa-box"></i>
                              </div>

                              <div>
                                <strong>{product.name}</strong>
                                <span>
                                  ID: {productId}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="products-sku">
                              {product.sku}
                            </span>
                          </td>

                          <td>
                            <span className="products-category">
                              {product.category}
                            </span>
                          </td>

                          <td>
                            <strong className="products-price">
                              ₹
                              {Number(product.price || 0).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </strong>
                          </td>

                          <td>
                            <span className="products-cost-price">
                              ₹
                              {Number(
                                product.costPrice || 0
                              ).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </td>

                          <td>
                            <div className="products-stock-cell">
                              <strong>
                                {product.quantity || 0}
                              </strong>

                              <span>
                                Threshold:{" "}
                                {product.lowStockThreshold ?? 10}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`products-status ${status.className}`}
                            >
                              <i className={status.icon}></i>
                              {status.label}
                            </span>
                          </td>

                          <td>
                            <div className="products-actions-wrapper">
                              <button
                                type="button"
                                className="products-action-btn"
                                onClick={() =>
                                  setOpenActionId(
                                    openActionId === productId
                                      ? null
                                      : productId
                                  )
                                }
                                title="More actions"
                              >
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                              </button>

                              {openActionId === productId && (
                                <div className="products-action-menu">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditProductModal(product)
                                    }
                                  >
                                    <i className="fa-solid fa-pen"></i>
                                    Edit Product
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openStockModal(
                                        product,
                                        "add"
                                      )
                                    }
                                  >
                                    <i className="fa-solid fa-plus"></i>
                                    Add Stock
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openStockModal(
                                        product,
                                        "remove"
                                      )
                                    }
                                  >
                                    <i className="fa-solid fa-minus"></i>
                                    Remove Stock
                                  </button>

                                  <div className="products-menu-divider"></div>

                                  <button
                                    type="button"
                                    className="delete-action"
                                    onClick={() =>
                                      openDeleteModal(product)
                                    }
                                  >
                                    <i className="fa-solid fa-trash"></i>
                                    Delete Product
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

              {/* Pagination */}
              {(
                <div className="products-pagination">
                  <span>
                    Page {page} of {totalPages}
                  </span>

                  <div className="products-pagination-buttons">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() =>
                        setPage((prev) => Math.max(1, prev - 1))
                      }
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    )
                      .filter((pageNumber) => {
                        return (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          Math.abs(pageNumber - page) <= 1
                        );
                      })
                      .map((pageNumber, index, arr) => {
                        const previousPage = arr[index - 1];

                        return (
                          <React.Fragment key={pageNumber}>
                            {previousPage &&
                              pageNumber - previousPage > 1 && (
                                <span className="products-pagination-dots">
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
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {showProductModal && <ProductModal />}

      {showStockModal && <StockModal />}

      {deleteProduct && <DeleteModal />}
    </div>
  );
};

export default Products;