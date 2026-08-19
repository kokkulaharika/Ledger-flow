LedgerFlow — Billing & Inventory SaaS
Introduction

LedgerFlow is a backend API for a Billing and Inventory Management SaaS application.

It helps businesses manage products, customers, suppliers, sales, purchases, expenses, invoices, payments, GST reports, and business analytics through REST APIs.

The backend is built with Node.js, Express.js, and MongoDB. Authentication and user-level data isolation are implemented to ensure that users can access only their own business data.

Tech Stack
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
Testing & Development
Postman
Git
GitHub
Visual Studio Code
Completed Features
Authentication
User registration
User login
JWT authentication
Protected API routes
Product Management
Create, read, update, and delete products
SKU management
Product search, filtering, and pagination
Stock quantity management
Low-stock threshold
Customer Management
Customer CRUD operations
Search, filtering, and pagination
User ownership validation
Supplier Management
Supplier CRUD operations
Search, filtering, and pagination
User ownership validation
Sales Management
Create and retrieve sales
Product-based sales
Automatic inventory deduction
Sales analytics
Purchase Management
Create, read, update, and delete purchases
Supplier and product association
Automatic inventory updates
Purchase total calculation
Inventory synchronization during purchase updates
MongoDB transactions
Expense Management
Expense CRUD operations
Expense categories
Expense tracking
Expense analytics
Invoice Management
Invoice creation and retrieval
Customer and product association
Invoice item validation
Quantity and price calculations
Invoice total calculation
Payment Management
Payment tracking
Pending, partial, and full payment handling
Overpayment rejection
Payment status management
Reports & Dashboard
GST reporting
Sales analytics
Expense analytics
Profit and Loss report
Business dashboard summary
Revenue, cost, profit, and expense calculations
Security & Validation
JWT-based authentication
Protected API endpoints
User ownership validation using createdBy
Cross-user data isolation testing
Required field validation
Quantity validation
Cost price validation
Invalid resource handling
Overpayment validation
Inventory consistency checks
Purchase Inventory Logic

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

Purchase creation and updates use MongoDB transactions to maintain data consistency.

Project Structure
Billing-Inventory-SaaS/
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authcontroller.js
│   │   ├── productcontroller.js
│   │   ├── customercontroller.js
│   │   ├── suppliercontroller.js
│   │   ├── salecontroller.js
│   │   ├── purchasecontroller.js
│   │   ├── expensecontroller.js
│   │   ├── invoicecontroller.js
│   │   ├── paymentcontroller.js
│   │   ├── reportcontroller.js
│   │   └── dashboardcontroller.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── customer.js
│   │   ├── supplier.js
│   │   ├── sale.js
│   │   ├── purchase.js
│   │   ├── expense.js
│   │   ├── invoice.js
│   │   └── payment.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── saleRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reportRoutes.js
│   │   └── dashboardRoutes.js
│   │
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── client/
├── .gitignore
└── README.md

.env and node_modules are excluded from GitHub using .gitignore.

Testing

All backend APIs have been tested using Postman.

Testing includes:

CRUD operations
Authentication
Validation
Inventory updates
Purchase transactions
Payment validation
Search/filter/pagination
Reports and dashboard
Cross-user security and data isolation
Current Status

Backend: Completed and tested

Next Phase: React frontend development and API integration

Author
Harika Kokkula
B.Tech — Computer Science Engineering