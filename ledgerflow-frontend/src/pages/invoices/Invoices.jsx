
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./invoices.css";

const Invoices = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [showInvoiceModal, setShowInvoiceModal] =
    useState(false);
  const [editingInvoice, setEditingInvoice] =
    useState(null);

  const [deleteInvoice, setDeleteInvoice] =
    useState(null);

  const [paymentInvoice, setPaymentInvoice] =
    useState(null);

  // Payment modal state
  const [paymentAmount, setPaymentAmount] =
    useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("Cash");
  const [paymentError, setPaymentError] =
    useState("");

  const [openActionId, setOpenActionId] =
    useState(null);

  const token = localStorage.getItem("token");

  const ITEMS_PER_PAGE = 10;

  // =========================
  // FETCH INVOICES
  // =========================

  const fetchInvoices = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setInvoices(response.data.invoices || []);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load invoices. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  // =========================
  // FETCH CUSTOMERS
  // =========================

  const fetchCustomers = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api.get("/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setCustomers(response.data.customers || []);
      }
    } catch (err) {
      console.error(
        "Error fetching customers:",
        err
      );
    }
  }, [token]);

  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api.get("/products", {
        headers: {
  Authorization: `Bearer ${token}`,
},
      });

      if (response.data?.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      console.error(
        "Error fetching products:",
        err
      );
    }
  }, [token]);

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchInvoices();
    fetchCustomers();
    fetchProducts();
  }, [
    token,
    navigate,
    fetchInvoices,
    fetchCustomers,
    fetchProducts,
  ]);

  // =========================
  // SEARCH
  // =========================

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // =========================
  // STATUS FILTER
  // =========================

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  // =========================
  // FILTERED INVOICES
  // =========================

  const filteredInvoices = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const customerName =
        invoice.customer?.name ||
        invoice.customer?.customerName ||
        "";

      const matchesSearch =
        !searchTerm ||
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(searchTerm) ||
        customerName
          .toLowerCase()
          .includes(searchTerm) ||
        invoice.paymentStatus
          ?.toLowerCase()
          .includes(searchTerm) ||
        invoice.invoiceStatus
          ?.toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        statusFilter === "All" ||
        invoice.paymentStatus === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [
    invoices,
    search,
    statusFilter,
  ]);

  // =========================
  // PAGINATION
  // =========================

  const totalInvoices =
    filteredInvoices.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalInvoices / ITEMS_PER_PAGE
    )
  );

  const currentPageInvoices =
    filteredInvoices.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > totalPages
    ) {
      return;
    }

    setPage(newPage);
    setOpenActionId(null);
  };

  // =========================
  // SUMMARY
  // =========================

  const totalAmount = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.grandTotal || 0),
    0
  );

  const paidAmount = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.paidAmount || 0),
    0
  );

  const pendingAmount = invoices.reduce(
    (sum, invoice) =>
      sum +
      Math.max(
        Number(invoice.grandTotal || 0) -
          Number(invoice.paidAmount || 0),
        0
      ),
    0
  );

  const paidInvoices = invoices.filter(
    (invoice) =>
      invoice.paymentStatus === "Paid"
  ).length;

  // =========================
  // ADD INVOICE
  // =========================

  const openAddInvoiceModal = async () => {
    setEditingInvoice(null);
    setError("");
    setLoadingFormData(true);

    try {
      await Promise.all([
        fetchCustomers(),
        fetchProducts(),
      ]);

      setShowInvoiceModal(true);
    } finally {
      setLoadingFormData(false);
    }

    setOpenActionId(null);
  };

  // =========================
  // EDIT INVOICE
  // =========================

  const openEditInvoiceModal = async (
    invoice
  ) => {
    setEditingInvoice(invoice);
    setError("");
    setLoadingFormData(true);

    try {
      await Promise.all([
        fetchCustomers(),
        fetchProducts(),
      ]);

      setShowInvoiceModal(true);
    } finally {
      setLoadingFormData(false);
    }

    setOpenActionId(null);
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setEditingInvoice(null);
  };

  // =========================
  // SAVE INVOICE
  // =========================

  const handleSaveInvoice = async (
    formData
  ) => {
    try {
      setError("");

      if (editingInvoice) {
        const invoiceId =
          editingInvoice._id ||
          editingInvoice.id;

        await api.put(
          `/invoices/${invoiceId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await api.post(
          "/invoices",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      closeInvoiceModal();

      await fetchInvoices();

      setPage(1);
    } catch (err) {
      console.error(
        "Error saving invoice:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to save invoice. Please try again."
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const openDeleteModal = (invoice) => {
    setDeleteInvoice(invoice);
    setOpenActionId(null);
  };

  const closeDeleteModal = () => {
    setDeleteInvoice(null);
  };

  const handleDeleteInvoice = async () => {
    if (!deleteInvoice) return;

    try {
      setError("");

      const invoiceId =
        deleteInvoice._id ||
        deleteInvoice.id;

      await api.delete(
        `/invoices/${invoiceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closeDeleteModal();

      await fetchInvoices();

      if (
        currentPageInvoices.length === 1 &&
        page > 1
      ) {
        setPage((prev) => prev - 1);
      }
    } catch (err) {
      console.error(
        "Error deleting invoice:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete invoice. Please try again."
      );
    }
  };

  // =========================
  // PAYMENT
  // =========================

  const openPaymentModal = (invoice) => {
    setPaymentInvoice(invoice);
    setPaymentAmount("");
    setPaymentMethod(
      invoice.paymentMethod || "Cash"
    );
    setPaymentError("");
    setOpenActionId(null);
  };

  const closePaymentModal = () => {
    setPaymentInvoice(null);
    setPaymentAmount("");
    setPaymentMethod("Cash");
    setPaymentError("");
  };

  const handleRecordPayment = async () => {
    if (!paymentInvoice) return;

    const numericAmount =
      Number(paymentAmount);

    const remaining =
      Number(
        paymentInvoice.grandTotal || 0
      ) -
      Number(
        paymentInvoice.paidAmount || 0
      );

    if (
      !numericAmount ||
      numericAmount <= 0
    ) {
      setPaymentError(
        "Enter a payment amount greater than 0."
      );
      return;
    }

    if (numericAmount > remaining) {
      setPaymentError(
        `Payment cannot exceed ₹${remaining.toFixed(
          2
        )}.`
      );
      return;
    }

    try {
      setError("");

      const invoiceId =
        paymentInvoice._id ||
        paymentInvoice.id;

      await api.post(
        `/invoices/${invoiceId}/payment`,
        {
          amount: numericAmount,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closePaymentModal();

      await fetchInvoices();
    } catch (err) {
      console.error(
        "Error recording payment:",
        err
      );

      setPaymentError(
        err.response?.data?.message ||
          "Failed to record payment. Please try again."
      );
    }
  };

  // =========================
  // PAGINATION BUTTONS
  // =========================

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const buttons = [];

    buttons.push(
      <button
        key="previous"
        type="button"
        disabled={page === 1}
        onClick={() =>
          handlePageChange(page - 1)
        }
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
    );

    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      page -
        Math.floor(
          maxVisiblePages / 2
        )
    );

    let endPage = Math.min(
      totalPages,
      startPage +
        maxVisiblePages -
        1
    );

    if (
      endPage - startPage <
      maxVisiblePages - 1
    ) {
      startPage = Math.max(
        1,
        endPage -
          maxVisiblePages +
          1
      );
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          type="button"
          className={
            page === 1 ? "active" : ""
          }
          onClick={() =>
            handlePageChange(1)
          }
        >
          1
        </button>
      );

      if (startPage > 2) {
        buttons.push(
          <span
            key="dots-start"
            className="invoices-pagination-dots"
          >
            ...
          </span>
        );
      }
    }

    for (
      let i = startPage;
      i <= endPage;
      i++
    ) {
      if (
        i === 1 &&
        startPage > 1
      ) {
        continue;
      }

      buttons.push(
        <button
          key={i}
          type="button"
          className={
            page === i ? "active" : ""
          }
          onClick={() =>
            handlePageChange(i)
          }
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (
        endPage <
        totalPages - 1
      ) {
        buttons.push(
          <span
            key="dots-end"
            className="invoices-pagination-dots"
          >
            ...
          </span>
        );
      }

      buttons.push(
        <button
          key={totalPages}
          type="button"
          className={
            page === totalPages
              ? "active"
              : ""
          }
          onClick={() =>
            handlePageChange(
              totalPages
            )
          }
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        type="button"
        disabled={
          page === totalPages
        }
        onClick={() =>
          handlePageChange(
            page + 1
          )
        }
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    );

    return buttons;
  };

  // =========================
  // INVOICE MODAL
  // =========================

  const InvoiceModal = () => {
    const [formData, setFormData] =
      useState({
        invoiceNumber:
          editingInvoice?.invoiceNumber ||
          `INV-${Date.now()
            .toString()
            .slice(-6)}`,

        customer:
          editingInvoice?.customer?._id ||
          editingInvoice?.customer ||
          "",

        items:
          editingInvoice?.items?.map(
            (item) => ({
              product:
                item.product?._id ||
                item.product ||
                "",
              quantity:
                item.quantity || 1,
              price:
                item.price || 0,
              total:
                item.total || 0,
            })
          ) || [
            {
              product: "",
              quantity: 1,
              price: 0,
              total: 0,
            },
          ],

        gst:
          editingInvoice?.gst || 0,

        paidAmount:
          editingInvoice?.paidAmount ||
          0,

        paymentMethod:
          editingInvoice?.paymentMethod ||
          "",

        paymentStatus:
          editingInvoice?.paymentStatus ||
          "Pending",

        invoiceStatus:
          editingInvoice?.invoiceStatus ||
          "Draft",
      });

    const [formError, setFormError] =
      useState("");

    const subtotal =
      formData.items.reduce(
        (sum, item) =>
          sum +
          Number(item.total || 0),
        0
      );

    const gstAmount =
      (subtotal *
        Number(formData.gst || 0)) /
      100;

    const grandTotal =
      subtotal + gstAmount;

    const handleBasicChange = (e) => {
      const {
        name,
        value,
      } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleProductChange = (
      index,
      productId
    ) => {
      const selectedProduct =
        products.find(
          (product) =>
            (product._id ||
              product.id) ===
            productId
        );

      setFormData((prev) => {
        const updatedItems = [
          ...prev.items,
        ];

        const quantity =
          Number(
            updatedItems[index]
              .quantity || 1
          );

        const price = Number(
          selectedProduct?.price ||
            0
        );

        updatedItems[index] = {
          ...updatedItems[index],
          product: productId,
          price,
          total:
            quantity * price,
        };

        return {
          ...prev,
          items: updatedItems,
        };
      });
    };

    const handleItemChange = (
      index,
      field,
      value
    ) => {
      setFormData((prev) => {
        const updatedItems = [
          ...prev.items,
        ];

        const updatedItem = {
          ...updatedItems[index],
          [field]: value,
        };

        const quantity =
          Number(
            updatedItem.quantity || 0
          );

        const price =
          Number(
            updatedItem.price || 0
          );

        updatedItem.total =
          quantity * price;

        updatedItems[index] =
          updatedItem;

        return {
          ...prev,
          items: updatedItems,
        };
      });
    };

    const addItem = () => {
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            product: "",
            quantity: 1,
            price: 0,
            total: 0,
          },
        ],
      }));
    };

    const removeItem = (index) => {
      if (
        formData.items.length === 1
      ) {
        return;
      }

      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
      }));
    };

    const handleSubmit = async (
      e
    ) => {
      e.preventDefault();

      if (
        !formData.invoiceNumber.trim()
      ) {
        setFormError(
          "Invoice number is required."
        );
        return;
      }

      if (!formData.customer) {
        setFormError(
          "Please select a customer."
        );
        return;
      }

      if (
        !formData.items.length
      ) {
        setFormError(
          "Invoice must contain at least one product."
        );
        return;
      }

      const invalidItem =
        formData.items.some(
          (item) =>
            !item.product ||
            Number(item.quantity) < 1
        );

      if (invalidItem) {
        setFormError(
          "Please select a product and enter a valid quantity."
        );
        return;
      }

      const paid =
        Number(
          formData.paidAmount || 0
        );

      if (paid > grandTotal) {
        setFormError(
          "Paid amount cannot exceed grand total."
        );
        return;
      }

      let paymentStatus =
        "Pending";

      if (paid === 0) {
        paymentStatus =
          "Pending";
      } else if (
        paid < grandTotal
      ) {
        paymentStatus =
          "Partially Paid";
      } else {
        paymentStatus =
          "Paid";
      }

      const payload = {
        invoiceNumber:
          formData.invoiceNumber.trim(),

        customer:
          formData.customer,

        items:
          formData.items.map(
            (item) => ({
              product:
                item.product,
              quantity:
                Number(
                  item.quantity
                ),
              price:
                Number(
                  item.price
                ),
              total:
                Number(
                  item.total
                ),
            })
          ),

        subtotal:
          Number(
            subtotal.toFixed(2)
          ),

        gst:
          Number(
            gstAmount.toFixed(2)
          ),

        grandTotal:
          Number(
            grandTotal.toFixed(2)
          ),

        paidAmount: paid,

        paymentMethod:
          formData.paymentMethod ||
          undefined,

        paymentStatus,

        invoiceStatus:
          formData.invoiceStatus,
      };

      await handleSaveInvoice(
        payload
      );
    };

    return (
      <div className="invoices-modal-overlay">
        <div className="invoices-modal invoices-large-modal">
          <div className="invoices-modal-header">
            <div>
              <h2>
                {editingInvoice
                  ? "Edit Invoice"
                  : "Create New Invoice"}
              </h2>

              <p>
                {editingInvoice
                  ? "Update invoice details"
                  : "Create a new customer invoice"}
              </p>
            </div>

            <button
              type="button"
              className="invoices-modal-close"
              onClick={
                closeInvoiceModal
              }
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
          >
            {formError && (
              <div className="invoices-form-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>
                  {formError}
                </span>
              </div>
            )}

            <div className="invoices-form-grid">
              <div className="invoices-form-group">
                <label>
                  Invoice Number{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="invoiceNumber"
                  value={
                    formData.invoiceNumber
                  }
                  onChange={
                    handleBasicChange
                  }
                  placeholder="INV-1001"
                  required
                />
              </div>

              <div className="invoices-form-group">
                <label>
                  Customer{" "}
                  <span>*</span>
                </label>

                <select
                  name="customer"
                  value={
                    formData.customer
                  }
                  onChange={
                    handleBasicChange
                  }
                  required
                >
                  <option value="">
                    Select Customer
                  </option>

                  {customers.map(
                    (customer) => (
                      <option
                        key={
                          customer._id ||
                          customer.id
                        }
                        value={
                          customer._id ||
                          customer.id
                        }
                      >
                        {customer.name ||
                          customer.customerName}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="invoices-form-group">
                <label>
                  Invoice Status
                </label>

                <select
                  name="invoiceStatus"
                  value={
                    formData.invoiceStatus
                  }
                  onChange={
                    handleBasicChange
                  }
                >
                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Issued">
                    Issued
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>

              <div className="invoices-form-group">
                <label>
                  GST (%)
                </label>

                <input
                  type="number"
                  name="gst"
                  value={
                    formData.gst
                  }
                  onChange={
                    handleBasicChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>
            </div>

            {/* ITEMS */}

            <div className="invoices-items-section">
              <div className="invoices-items-header">
                <div>
                  <h3>
                    Invoice Items
                  </h3>

                  <p>
                    Add products and
                    quantities
                  </p>
                </div>

                <button
                  type="button"
                  className="invoices-add-item-btn"
                  onClick={addItem}
                >
                  <i className="fa-solid fa-plus"></i>
                  Add Item
                </button>
              </div>

              <div className="invoices-items-table-wrapper">
                <table className="invoices-items-table">
                  <thead>
                    <tr>
                      <th>
                        Product
                      </th>

                      <th>
                        Quantity
                      </th>

                      <th>
                        Price
                      </th>

                      <th>
                        Total
                      </th>

                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {formData.items.map(
                      (
                        item,
                        index
                      ) => (
                        <tr
                          key={
                            index
                          }
                        >
                          <td>
                            <select
                              value={
                                item.product
                              }
                              onChange={(
                                e
                              ) =>
                                handleProductChange(
                                  index,
                                  e.target
                                    .value
                                )
                              }
                            >
                              <option value="">
                                Select Product
                              </option>

                              {products.map(
                                (
                                  product
                                ) => (
                                  <option
                                    key={
                                      product._id ||
                                      product.id
                                    }
                                    value={
                                      product._id ||
                                      product.id
                                    }
                                  >
                                    {
                                      product.name
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </td>

                          <td>
                            <input
                              type="number"
                              min="1"
                              value={
                                item.quantity
                              }
                              onChange={(
                                e
                              ) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e
                                    .target
                                    .value
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                item.price
                              }
                              onChange={(
                                e
                              ) =>
                                handleItemChange(
                                  index,
                                  "price",
                                  e
                                    .target
                                    .value
                                )
                              }
                            />
                          </td>

                          <td>
                            <strong>
                              ₹
                              {Number(
                                item.total ||
                                  0
                              ).toFixed(
                                2
                              )}
                            </strong>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="invoices-remove-item-btn"
                              onClick={() =>
                                removeItem(
                                  index
                                )
                              }
                              disabled={
                                formData
                                  .items
                                  .length ===
                                1
                              }
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAYMENT */}

            <div className="invoices-payment-section">
              <div className="invoices-form-group">
                <label>
                  Paid Amount
                </label>

                <input
                  type="number"
                  name="paidAmount"
                  value={
                    formData.paidAmount
                  }
                  onChange={
                    handleBasicChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>

              <div className="invoices-form-group">
                <label>
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={
                    formData.paymentMethod
                  }
                  onChange={
                    handleBasicChange
                  }
                >
                  <option value="">
                    Select Method
                  </option>

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Card">
                    Card
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>
            </div>

            {/* TOTALS */}

            <div className="invoices-total-box">
              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {subtotal.toFixed(
                    2
                  )}
                </strong>
              </div>

              <div>
                <span>
                  GST
                </span>

                <strong>
                  ₹
                  {gstAmount.toFixed(
                    2
                  )}
                </strong>
              </div>

              <div className="invoices-grand-total">
                <span>
                  Grand Total
                </span>

                <strong>
                  ₹
                  {grandTotal.toFixed(
                    2
                  )}
                </strong>
              </div>
            </div>

            <div className="invoices-modal-footer">
              <button
                type="button"
                className="invoices-secondary-btn"
                onClick={
                  closeInvoiceModal
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="invoices-primary-btn"
              >
                <i className="fa-solid fa-check"></i>

                {editingInvoice
                  ? "Update Invoice"
                  : "Create Invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // =========================
  // DELETE MODAL
  // =========================

  const DeleteModal = () => {
    if (!deleteInvoice) {
      return null;
    }

    return (
      <div className="invoices-modal-overlay">
        <div className="invoices-delete-modal">
          <div className="invoices-delete-icon">
            <i className="fa-solid fa-trash"></i>
          </div>

          <h2>
            Delete Invoice?
          </h2>

          <p>
            Are you sure you want to
            delete{" "}
            <strong>
              {
                deleteInvoice.invoiceNumber
              }
            </strong>
            ? This action cannot be
            undone.
          </p>

          <div className="invoices-delete-actions">
            <button
              type="button"
              className="invoices-secondary-btn"
              onClick={
                closeDeleteModal
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="invoices-danger-btn"
              onClick={
                handleDeleteInvoice
              }
            >
              <i className="fa-solid fa-trash"></i>
              Delete Invoice
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =========================
  // PAYMENT MODAL
  // =========================

  const PaymentModal = () => {
    if (!paymentInvoice) {
      return null;
    }

    const remaining =
      Number(
        paymentInvoice.grandTotal ||
          0
      ) -
      Number(
        paymentInvoice.paidAmount ||
          0
      );

    return (
      <div className="invoices-modal-overlay">
        <div className="invoices-payment-modal">
          <div className="invoices-modal-header">
            <div>
              <h2>
                Record Payment
              </h2>

              <p>
                {
                  paymentInvoice.invoiceNumber
                }
              </p>
            </div>

            <button
              type="button"
              className="invoices-modal-close"
              onClick={
                closePaymentModal
              }
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="invoices-payment-modal-form">
            <div className="invoices-payment-summary">
              <div>
                <span>
                  Invoice Total
                </span>

                <strong>
                  ₹
                  {Number(
                    paymentInvoice.grandTotal ||
                      0
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>
                  Already Paid
                </span>

                <strong>
                  ₹
                  {Number(
                    paymentInvoice.paidAmount ||
                      0
                  ).toFixed(2)}
                </strong>
              </div>

              <div className="remaining">
                <span>
                  Remaining
                </span>

                <strong>
                  ₹
                  {remaining.toFixed(
                    2
                  )}
                </strong>
              </div>
            </div>

            {paymentError && (
              <div className="invoices-form-error">
                <i className="fa-solid fa-circle-exclamation"></i>

                <span>
                  {paymentError}
                </span>
              </div>
            )}

            <div className="invoices-form-group">
              <label>
                Payment Amount{" "}
                <span>*</span>
              </label>

              <input
                type="number"
                value={
                  paymentAmount
                }
                onChange={(e) => {
                  setPaymentAmount(
                    e.target.value
                  );
                  setPaymentError(
                    ""
                  );
                }}
                min="0.01"
                max={remaining}
                step="0.01"
                placeholder="Enter amount"
              />
            </div>

            <div className="invoices-form-group">
              <label>
                Payment Method
              </label>

              <select
                value={
                  paymentMethod
                }
                onChange={(e) => {
                  setPaymentMethod(
                    e.target.value
                  );
                  setPaymentError(
                    ""
                  );
                }}
              >
                <option value="Cash">
                  Cash
                </option>

                <option value="UPI">
                  UPI
                </option>

                <option value="Card">
                  Card
                </option>

                <option value="Bank Transfer">
                  Bank Transfer
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div className="invoices-modal-footer">
              <button
                type="button"
                className="invoices-secondary-btn"
                onClick={
                  closePaymentModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="invoices-primary-btn"
                onClick={
                  handleRecordPayment
                }
              >
                <i className="fa-solid fa-money-bill-wave"></i>
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <i className="fa-solid fa-layer-group"></i>
          </div>

          <span>
            LedgerFlow
          </span>
        </div>

        <nav className="dashboard-navigation">
          <Link
            to="/dashboard"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-chart-pie"></i>
            <span>
              Dashboard
            </span>
          </Link>

          <Link
            to="/products"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-box"></i>
            <span>
              Products
            </span>
          </Link>

          <Link
            to="/sales"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>
              Sales
            </span>
          </Link>

          <Link
            to="/purchases"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-truck"></i>
            <span>
              Purchases
            </span>
          </Link>

          <Link
            to="/customers"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-users"></i>
            <span>
              Customers
            </span>
          </Link>

          <Link
            to="/suppliers"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-boxes-stacked"></i>
            <span>
              Suppliers
            </span>
          </Link>

          <Link
            to="/invoices"
            className="dashboard-nav-item active"
          >
            <i className="fa-solid fa-file-invoice"></i>
            <span>
              Invoices
            </span>
          </Link>

          <Link
            to="/expenses"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-wallet"></i>
            <span>
              Expenses
            </span>
          </Link>

          <Link
            to="/reports"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-chart-column"></i>
            <span>
              Reports
            </span>
          </Link>

          <Link
            to="/settings"
            className="dashboard-nav-item"
          >
            <i className="fa-solid fa-gear"></i>
            <span>
              Settings
            </span>
          </Link>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <button
            type="button"
            className="dashboard-nav-item dashboard-logout"
            onClick={() => {
              localStorage.removeItem(
                "token"
              );
              localStorage.removeItem(
                "user"
              );
              navigate("/login");
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="dashboard-main invoices-main">
        <div className="invoices-page-header">
          <div>
            <div className="invoices-breadcrumb">
              <Link
                to="/dashboard"
                className="invoices-breadcrumb-link"
              >
                Dashboard
              </Link>

              <i className="fa-solid fa-chevron-right"></i>

              <strong>
                Invoices
              </strong>
            </div>

            <h1>
              Invoices
            </h1>

            <p>
              Create and manage customer
              invoices and payments.
            </p>
          </div>

          <button
            type="button"
            className="invoices-primary-btn invoices-add-btn"
            onClick={
              openAddInvoiceModal
            }
          >
            <i className="fa-solid fa-plus"></i>
            Create Invoice
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="invoices-error">
            <div>
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        {/* SUMMARY */}

        <div className="invoices-summary-grid">
          <div className="invoices-summary-card">
            <div className="invoices-summary-icon">
              <i className="fa-solid fa-file-invoice"></i>
            </div>

            <div>
              <span>
                Total Invoices
              </span>

              <strong>
                {invoices.length}
              </strong>
            </div>
          </div>

          <div className="invoices-summary-card">
            <div className="invoices-summary-icon">
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>

            <div>
              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {totalAmount.toFixed(
                  2
                )}
              </strong>
            </div>
          </div>

          <div className="invoices-summary-card">
            <div className="invoices-summary-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>

            <div>
              <span>
                Paid Amount
              </span>

              <strong>
                ₹
                {paidAmount.toFixed(
                  2
                )}
              </strong>
            </div>
          </div>

          <div className="invoices-summary-card">
            <div className="invoices-summary-icon">
              <i className="fa-solid fa-clock"></i>
            </div>

            <div>
              <span>
                Pending Amount
              </span>

              <strong>
                ₹
                {pendingAmount.toFixed(
                  2
                )}
              </strong>
            </div>
          </div>
        </div>

        {/* FILTER */}

        <div className="invoices-filter-panel">
          <div className="invoices-search-box">
            <i className="fa-solid fa-magnifying-glass"></i>

            <input
              type="text"
              value={search}
              onChange={
                handleSearchChange
              }
              placeholder="Search invoice number, customer or status..."
            />
          </div>

          <div className="invoices-status-filter">
            <i className="fa-solid fa-filter"></i>

            <select
              value={
                statusFilter
              }
              onChange={
                handleStatusFilterChange
              }
            >
              <option value="All">
                All Payments
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Partially Paid">
                Partially Paid
              </option>

              <option value="Paid">
                Paid
              </option>
            </select>
          </div>

          {(search ||
            statusFilter !==
              "All") && (
            <button
              type="button"
              className="invoices-clear-btn"
              onClick={() => {
                setSearch("");
                setStatusFilter(
                  "All"
                );
                setPage(1);
              }}
            >
              <i className="fa-solid fa-rotate-left"></i>
              Clear
            </button>
          )}
        </div>

        {/* TABLE */}

        <div className="invoices-table-card">
          <div className="invoices-table-header">
            <div>
              <h2>
                Invoice List
              </h2>

              <p>
                {totalInvoices}{" "}
                {totalInvoices ===
                1
                  ? "invoice"
                  : "invoices"}{" "}
                found
              </p>
            </div>

            <div className="invoices-paid-count">
              <i className="fa-solid fa-circle-check"></i>
              {paidInvoices}{" "}
              Paid
            </div>
          </div>

          {loading ? (
            <div className="invoices-loading">
              <div className="invoices-spinner"></div>

              <p>
                Loading invoices...
              </p>
            </div>
          ) : totalInvoices ===
            0 ? (
            <div className="invoices-empty">
              <div className="invoices-empty-icon">
                <i className="fa-solid fa-file-invoice"></i>
              </div>

              <h3>
                No Invoices Found
              </h3>

              <p>
                {search ||
                statusFilter !==
                  "All"
                  ? "Try changing your search or filter."
                  : "Start by creating your first invoice."}
              </p>

              {!search &&
                statusFilter ===
                  "All" && (
                  <button
                    type="button"
                    className="invoices-primary-btn"
                    onClick={
                      openAddInvoiceModal
                    }
                  >
                    <i className="fa-solid fa-plus"></i>
                    Create Invoice
                  </button>
                )}
            </div>
          ) : (
            <>
              <div className="invoices-table-wrapper">
                <table className="invoices-table">
                  <thead>
                    <tr>
                      <th>
                        Invoice
                      </th>

                      <th>
                        Customer
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Total
                      </th>

                      <th>
                        Payment
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentPageInvoices.map(
                      (invoice) => {
                        const invoiceId =
                          invoice._id ||
                          invoice.id;

                        const customerName =
                          invoice
                            .customer
                            ?.name ||
                          invoice
                            .customer
                            ?.customerName ||
                          "Unknown Customer";

                        const remaining =
                          Number(
                            invoice.grandTotal ||
                              0
                          ) -
                          Number(
                            invoice.paidAmount ||
                              0
                          );

                        return (
                          <tr
                            key={
                              invoiceId
                            }
                          >
                            <td>
                              <div className="invoices-number-cell">
                                <div className="invoices-table-icon">
                                  <i className="fa-solid fa-file-invoice"></i>
                                </div>

                                <div>
                                  <strong>
                                    {
                                      invoice.invoiceNumber
                                    }
                                  </strong>

                                  <span>
                                    {
                                      invoice
                                        .items
                                        ?.length ||
                                      0
                                    }{" "}
                                    item
                                    {invoice
                                      .items
                                      ?.length ===
                                    1
                                      ? ""
                                      : "s"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="invoices-customer-cell">
                                <div className="invoices-customer-avatar">
                                  {customerName
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <span>
                                  {
                                    customerName
                                  }
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className="invoices-date-cell">
                                <i className="fa-regular fa-calendar"></i>

                                <span>
                                  {new Date(
                                    invoice.createdAt
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month:
                                        "short",
                                      year:
                                        "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className="invoices-amount-cell">
                                <strong>
                                  ₹
                                  {Number(
                                    invoice.grandTotal ||
                                      0
                                  ).toFixed(
                                    2
                                  )}
                                </strong>

                                {remaining >
                                  0 && (
                                  <span>
                                    ₹
                                    {remaining.toFixed(
                                      2
                                    )}{" "}
                                    due
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <span
                                className={`invoices-payment-badge ${invoice.paymentStatus
                                  ?.toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    "-"
                                  )}`}
                              >
                                {
                                  invoice.paymentStatus
                                }
                              </span>
                            </td>

                            <td>
                              <span
                                className={`invoices-status-badge ${invoice.invoiceStatus?.toLowerCase()}`}
                              >
                                {
                                  invoice.invoiceStatus
                                }
                              </span>
                            </td>

                            <td>
                              <div className="invoices-actions-wrapper">
                                <button
                                  type="button"
                                  className="invoices-action-btn"
                                  onClick={() =>
                                    setOpenActionId(
                                      openActionId ===
                                        invoiceId
                                        ? null
                                        : invoiceId
                                    )
                                  }
                                >
                                  <i className="fa-solid fa-ellipsis-vertical"></i>
                                </button>

                                {openActionId ===
                                  invoiceId && (
                                  <div className="invoices-action-menu">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditInvoiceModal(
                                          invoice
                                        )
                                      }
                                    >
                                      <i className="fa-solid fa-pen"></i>
                                      Edit Invoice
                                    </button>

                                    {remaining >
                                      0 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openPaymentModal(
                                            invoice
                                          )
                                        }
                                      >
                                        <i className="fa-solid fa-money-bill-wave"></i>
                                        Record Payment
                                      </button>
                                    )}

                                    <div className="invoices-menu-divider"></div>

                                    <button
                                      type="button"
                                      className="delete-action"
                                      onClick={() =>
                                        openDeleteModal(
                                          invoice
                                        )
                                      }
                                    >
                                      <i className="fa-solid fa-trash"></i>
                                      Delete Invoice
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages >
                1 && (
                <div className="invoices-pagination">
                  <span>
                    Showing{" "}
                    {(page - 1) *
                      ITEMS_PER_PAGE +
                      1}
                    –
                    {Math.min(
                      page *
                        ITEMS_PER_PAGE,
                      totalInvoices
                    )}{" "}
                    of{" "}
                    {
                      totalInvoices
                    }{" "}
                    invoices
                  </span>

                  <div className="invoices-pagination-buttons">
                    {renderPaginationButtons()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODALS */}

      {showInvoiceModal &&
        !loadingFormData && (
          <InvoiceModal />
        )}

      {deleteInvoice && (
        <DeleteModal />
      )}

      {paymentInvoice && (
        <PaymentModal />
      )}
    </div>
  );
};

export default Invoices;

