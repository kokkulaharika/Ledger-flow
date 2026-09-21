# LedgerFlow — Billing & Inventory Management SaaS

## Introduction

LedgerFlow is a full-stack Billing and Inventory Management SaaS application designed to help small businesses manage their day-to-day business operations through a centralized platform.

It provides modules for managing products, inventory, sales, purchases, customers, suppliers, invoices, payments, expenses, reports, and business analytics.

The application is built with a **React.js frontend**, **Node.js and Express.js backend**, and **MongoDB** for data storage. JWT authentication and user-level data isolation are implemented to protect business data.

---

## Features

### Authentication & Security

* User registration and login
* JWT-based authentication
* Protected API endpoints
* Protected frontend routes
* User-level data isolation
* `createdBy` ownership validation
* Cross-user access prevention
* Input and resource validation

### Dashboard

* Business activity overview
* Sales summary
* Revenue tracking
* Cost tracking
* Expense information
* Profit and loss information
* Business performance metrics
* Interactive charts and analytics

### Product & Inventory Management

* Create, read, update, and delete products
* SKU management
* Product search
* Category filtering
* Pagination
* Stock quantity management
* Add and remove stock
* Low-stock threshold tracking
* Inventory synchronization with sales and purchases

### Sales Management

* Create and retrieve sales
* Update and delete sales
* Product-based sales
* Automatic inventory deduction
* Sales history
* Sales analytics
* Inventory restoration when applicable

### Purchase Management

* Create, read, update, and delete purchases
* Supplier and product association
* Automatic inventory updates
* Purchase total calculation
* Inventory synchronization during purchase updates
* MongoDB transaction support

#### Purchase Inventory Logic

When a purchase is created:

```text
Current Stock
     ↓
Add Purchase Quantity
     ↓
Updated Stock
```

When a purchase is updated:

```text
Current Stock
     ↓
Remove Old Purchase Quantity
     ↓
Add New Purchase Quantity
     ↓
Updated Stock
```

Purchase creation and updates use MongoDB transactions to maintain database consistency.

### Customer Management

* Customer CRUD operations
* Customer search
* Filtering
* Pagination
* User ownership validation

### Supplier Management

* Supplier CRUD operations
* Supplier search
* Filtering
* Pagination
* User ownership validation
* Supplier contact information

### Invoice Management

* Invoice creation and retrieval
* Customer and product association
* Invoice item validation
* Quantity and price calculations
* Invoice total calculation
* GST support
* Payment status tracking
* Pending/Paid status
* Pagination

### Payment Management

* Payment tracking
* Pending payments
* Partial payments
* Full payments
* Payment status management
* Payment validation
* Overpayment rejection

### Expense Management

* Create, read, update, and delete expenses
* Expense categories
* Expense descriptions
* Expense date tracking
* Payment method tracking
* Expense analytics

Supported payment methods:

* Cash
* UPI
* Card
* Bank Transfer

### Reports & Analytics

* GST reporting
* Sales analytics
* Expense analytics
* Profit and Loss reports
* Revenue calculations
* Cost calculations
* Gross profit calculations
* Net profit calculations
* Date-range based reporting
* Business performance analysis

### Settings

* Account settings
* Security-related configuration
* User-specific settings

---

## Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios
* React Router
* Recharts
* Font Awesome

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* REST APIs

### Development & Testing

* Git
* GitHub
* Postman
* Visual Studio Code

---

## System Architecture

```text
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │                      │
                    │  Dashboard           │
                    │  Products            │
                    │  Sales               │
                    │  Purchases           │
                    │  Customers           │
                    │  Suppliers           │
                    │  Invoices            │
                    │  Expenses            │
                    │  Reports             │
                    │  Settings            │
                    └──────────┬───────────┘
                               │
                         Axios / REST API
                               │
                               ↓
                    ┌──────────────────────┐
                    │   Express.js API     │
                    │                      │
                    │ Controllers          │
                    │ Routes               │
                    │ Middleware           │
                    │ Authentication       │
                    │ Validation           │
                    └──────────┬───────────┘
                               │
                         Mongoose ODM
                               │
                               ↓
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │                      │
                    │ Users                │
                    │ Products             │
                    │ Sales                │
                    │ Purchases            │
                    │ Customers            │
                    │ Suppliers            │
                    │ Invoices             │
                    │ Expenses             │
                    └──────────────────────┘
```

---

## Project Structure

```text
Ledger-flow/
│
├── ledgerflow-frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   └── landing/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   ├── dashboard/
│   │   │   ├── expenses/
│   │   │   ├── invoices/
│   │   │   ├── products/
│   │   │   ├── purchases/
│   │   │   ├── reports/
│   │   │   ├── sales/
│   │   │   ├── settings/
│   │   │   └── suppliers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── server/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   │
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## API Integration

The React frontend communicates with the Express.js backend through REST APIs using Axios.

```text
React.js Frontend
       │
       │ Axios
       ↓
REST API
       │
       ↓
Express.js Backend
       │
       ↓
Mongoose
       │
       ↓
MongoDB
```

The frontend uses a centralized Axios configuration for communication with the backend API.

---

## Security & Validation

LedgerFlow implements multiple security and validation mechanisms:

* JWT-based authentication
* Protected API endpoints
* Protected frontend routes
* User ownership validation using `createdBy`
* Cross-user data isolation
* Required field validation
* Quantity validation
* Cost price validation
* Invalid resource handling
* Payment validation
* Overpayment prevention
* Inventory consistency checks
* MongoDB transactions for purchase operations

Cross-user security testing has been performed to verify that users cannot access another user's business data.

---

## Testing

Backend APIs have been tested using Postman.

Testing includes:

* User registration and login
* JWT authentication
* CRUD operations
* Input validation
* Inventory updates
* Sales workflows
* Purchase workflows
* Purchase transactions
* Purchase update synchronization
* Payment validation
* Invoice workflows
* Expense workflows
* Search
* Filtering
* Pagination
* Reports
* Dashboard
* Cross-user security
* Data isolation

The frontend has also been tested across the major application workflows.

---

## Future Enhancements

* Production deployment
* PDF invoice generation
* Email invoice functionality
* Advanced business analytics
* Role-based access control
* Automated database backups
* Production monitoring
* Additional financial reports
* Cloud-based deployment
* Enhanced notification system

---

## Author

**Harika Kokkula**

B.Tech — Computer Science Engineering

GitHub: https://github.com/kokkulaharika
