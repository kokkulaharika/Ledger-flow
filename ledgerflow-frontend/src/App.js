import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import the landing page.
import LandingPage from "./pages/LandingPage";

// Import the registration page from the auth folder.
import Register from "./pages/auth/Register";

// Import the login page.
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Sales from "./pages/sales/Sales";
import Purchases from "./pages/purchases/Purchases";
import Customers from "./pages/customers/Customers";
import Suppliers from "./pages/suppliers/Suppliers";
import Invoices from "./pages/invoices/Invoices";
import Expenses from "./pages/expenses/Expenses";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings.jsx";
function App() {
  return (
    // BrowserRouter enables navigation between pages.
    <BrowserRouter>
      <Routes>
        {/* Landing page route */}
        <Route path="/" element={<LandingPage />} />

        {/* Register page route */}
        <Route path="/register" element={<Register />} />
        {/* Login page route */}
        <Route path="/login" element={<Login />} />
         {/* Protected dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/purchases" element={<Purchases/>}/>
        <Route path="/customers" element={<Customers/>}/>
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/invoices" element={<Invoices />}/>
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;