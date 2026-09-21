import React from "react";
import "./landing.css";

function Features() {
  return (
    <section className="landing-section features-section" id="features">

      <div className="landing-section-container">

        <span className="section-label">
          FEATURES
        </span>

        <h2>
          Everything you need to
          <span> manage your business.</span>
        </h2>

        <p className="section-description">
          LedgerFlow brings billing, inventory, sales, purchases,
          expenses, and business management together in one platform.
        </p>

        <div className="four-feature-grid">

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>

            <h3>Smart Billing</h3>

            <p>
              Create invoices, manage payments, and simplify your
              everyday billing process.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>

            <h3>Inventory Management</h3>

            <p>
              Track products, stock levels, and inventory movements
              with ease.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <i className="fa-solid fa-chart-line"></i>
            </div>

            <h3>Business Analytics</h3>

            <p>
              Understand your revenue, expenses, sales, and overall
              business performance.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>

            <h3>Secure Management</h3>

            <p>
              Keep your business information and transactions
              organized and protected.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}

export default Features;