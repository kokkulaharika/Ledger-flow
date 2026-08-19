# LedgerFlow — Billing & Inventory SaaS

## Introduction

LedgerFlow is a backend API for a Billing and Inventory Management SaaS application.

It helps businesses manage products, customers, suppliers, sales, purchases, expenses, invoices, payments, GST reports, and business analytics through REST APIs.

The backend is built using Node.js, Express.js, and MongoDB, with JWT authentication and user-level data isolation.

---

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Testing & Development

- Postman
- Git
- GitHub
- Visual Studio Code

---

## Completed Features

### Authentication

- User registration
- User login
- JWT authentication
- Protected API routes

### Product Management

- Create, read, update, and delete products
- SKU management
- Product search
- Filtering and pagination
- Stock quantity management
- Low-stock threshold

### Customer Management

- Customer CRUD operations
- Search, filtering, and pagination
- User ownership validation

### Supplier Management

- Supplier CRUD operations
- Search, filtering, and pagination
- User ownership validation

### Sales Management

- Create and retrieve sales
- Product-based sales
- Automatic inventory deduction
- Sales analytics

### Purchase Management

- Create, read, update, and delete purchases
- Supplier and product association
- Automatic inventory updates
- Purchase total calculation
- Inventory synchronization during purchase updates
- MongoDB transaction support

#### Purchase Inventory Logic

When a purchase is created:

    Current Stock
         ↓
    Add Purchase Quantity
         ↓
    Updated Stock

When a purchase is updated:

    Current Stock
         ↓
    Remove Old Purchase Quantity
         ↓
    Add New Purchase Quantity
         ↓
    Updated Stock

Purchase creation and updates use MongoDB transactions to maintain database consistency.

### Expense Management

- Create, read, update, and delete expenses
- Expense categories
- Expense tracking
- Expense analytics

### Invoice Management

- Invoice creation and retrieval
- Customer and product association
- Invoice item validation
- Quantity and price calculations
- Invoice total calculation

### Payment Management

- Payment tracking
- Pending payments
- Partial payments
- Full payments
- Payment status management
- Overpayment rejection

### Reports & Dashboard

- GST reporting
- Sales analytics
- Expense analytics
- Profit and Loss report
- Business dashboard summary
- Revenue and cost calculations
- Gross profit and net profit calculations

---

## Security & Validation

The backend implements:

- JWT-based authentication
- Protected API endpoints
- User ownership validation using `createdBy`
- Cross-user data isolation
- Required field validation
- Quantity validation
- Cost price validation
- Invalid resource handling
- Overpayment validation
- Inventory consistency checks

Cross-user security testing has been performed to ensure that users cannot access another user's business data.

---

## Project Structure

    Billing-Inventory-SaaS/
    │
    ├── server/
    │   │
    │   ├── src/
    │   │   │
    │   │   ├── config/
    │   │   │   └── db.js
    │   │   │
    │   │   ├── controllers/
    │   │   │   ├── authcontroller.js
    │   │   │   ├── customercontroller.js
    │   │   │   ├── dashboardcontroller.js
    │   │   │   ├── expenseController.js
    │   │   │   ├── invoicecontroller.js
    │   │   │   ├── productcontrollers.js
    │   │   │   ├── purchasecontroller.js
    │   │   │   ├── reportcontroller.js
    │   │   │   ├── salecontroller.js
    │   │   │   └── suppliercontroller.js
    │   │   │
    │   │   ├── middleware/
    │   │   │   ├── authMiddleware.js
    │   │   │   └── roleMIddleware.js
    │   │   │
    │   │   ├── models/
    │   │   │   ├── customer.js
    │   │   │   ├── expense.js
    │   │   │   ├── invoice.js
    │   │   │   ├── product.js
    │   │   │   ├── purchase.js
    │   │   │   ├── sales.js
    │   │   │   ├── supplier.js
    │   │   │   └── user.js
    │   │   │
    │   │   ├── routes/
    │   │   │   ├── authRoutes.js
    │   │   │   ├── customerRoutes.js
    │   │   │   ├── dashboardRoutes.js
    │   │   │   ├── expenseRoutes.js
    │   │   │   ├── invoiceRoutes.js
    │   │   │   ├── productroutes.js
    │   │   │   ├── purchaseRoutes.js
    │   │   │   ├── reportRoutes.js
    │   │   │   ├── salesroute.js
    │   │   │   └── supplierRoutes.js
    │   │   │
    │   │   └── utils/
    │   │       └── generatetoken.js
    │   │
    │   ├── .gitignore
    │   ├── package.json
    │   ├── package-lock.json
    │   └── server.js
    │
    ├── client/
    │
    ├── .gitignore
    └── README.md

`.env` and `node_modules` are excluded from GitHub using `.gitignore`.

---

## Testing

All backend APIs have been tested using Postman.

Testing includes:

- CRUD operations
- Authentication
- Input validation
- Inventory updates
- Purchase transactions
- Purchase update synchronization
- Payment validation
- Search, filtering, and pagination
- Reports and dashboard
- Cross-user security
- Data isolation

---

## Current Status

**Backend:** Completed and tested

**Frontend:** React frontend development will be started next.

**Next Phase:** Frontend development and API integration.

---

## Author

**Harika Kokkula**

B.Tech — Computer Science Engineering
