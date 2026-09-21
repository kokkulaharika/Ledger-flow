import React from "react";
import { Link } from "react-router-dom";

// Import the existing landing page styles.
import "./landing.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-container">

        {/* =========================================
            LEFT SIDE
            ========================================= */}
        <div className="hero-content">

          {/* Hero badge */}
          <div className="hero-badge">
            <i className="fa-solid fa-sparkles"></i>
            Smart Business Management
          </div>

          {/* Main heading */}
          <h1>
            Run Your Business
            <span>Smarter with LedgerFlow</span>
          </h1>

          {/* Hero description */}
          <p className="hero-description">
            Manage billing, inventory, sales, purchases, expenses,
            and business insights — all from one powerful platform.
          </p>

          {/* Hero action buttons */}
          <div className="hero-actions">

            {/* Navigate to the Register page */}
            <Link
              to="/register"
              className="hero-primary-btn"
            >
              Get Started

              <i className="fa-solid fa-arrow-right"></i>
            </Link>

            {/* Scroll to the Features section */}
            <a
              href="#features"
              className="hero-secondary-btn"
            >
              Explore Features

              <i className="fa-solid fa-arrow-down"></i>
            </a>

          </div>

          {/* Trust message */}
          <div className="hero-trust">
            <i className="fa-solid fa-circle-check"></i>

            <span>
              Everything your business needs in one place
            </span>
          </div>

        </div>


        {/* =========================================
            RIGHT SIDE — DASHBOARD PREVIEW
            ========================================= */}
        <div className="hero-visual">

          <div className="dashboard-preview">

            {/* Dashboard Header */}
            <div className="dashboard-preview-header">

              {/* Browser-style dots */}
              <div className="dashboard-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              {/* Dashboard title */}
              <div className="dashboard-title">
                Dashboard
              </div>

              {/* Notification icon */}
              <div className="dashboard-notification">
                <i className="fa-regular fa-bell"></i>
              </div>

            </div>


            {/* Dashboard Body */}
            <div className="dashboard-preview-body">

              {/* Welcome section */}
              <div className="dashboard-welcome">

                <small>
                  Welcome back
                </small>

                <h3>
                  Business Overview
                </h3>

              </div>


              {/* =================================
                  STATS
                  ================================= */}
              <div className="dashboard-stats">

                {/* Revenue */}
                <div className="dashboard-stat-card">

                  <div className="dashboard-stat-icon">
                    <i className="fa-solid fa-indian-rupee-sign"></i>
                  </div>

                  <small>
                    Total Revenue
                  </small>

                  <strong>
                    ₹1,25,000
                  </strong>

                  <div className="dashboard-growth">
                    <i className="fa-solid fa-arrow-trend-up"></i>
                    12.5%
                  </div>

                </div>


                {/* Sales */}
                <div className="dashboard-stat-card">

                  <div className="dashboard-stat-icon">
                    <i className="fa-solid fa-cart-shopping"></i>
                  </div>

                  <small>
                    Total Sales
                  </small>

                  <strong>
                    84
                  </strong>

                  <div className="dashboard-growth">
                    <i className="fa-solid fa-arrow-trend-up"></i>
                    8.2%
                  </div>

                </div>


                {/* Inventory */}
                <div className="dashboard-stat-card">

                  <div className="dashboard-stat-icon">
                    <i className="fa-solid fa-box"></i>
                  </div>

                  <small>
                    Inventory Items
                  </small>

                  <strong>
                    342
                  </strong>

                  <div className="dashboard-growth">
                    In Stock
                  </div>

                </div>

              </div>


              {/* =================================
                  REVENUE CHART
                  ================================= */}
              <div className="dashboard-chart">

                <div className="dashboard-chart-header">

                  <div>
                    <span>
                      Revenue Overview
                    </span>

                    <strong>
                      ₹1,25,000
                    </strong>
                  </div>

                  <i className="fa-solid fa-chart-line"></i>

                </div>


                {/* Chart bars */}
                <div className="chart-bars">

                  <div
                    className="chart-bar"
                    style={{ height: "45%" }}
                  ></div>

                  <div
                    className="chart-bar"
                    style={{ height: "60%" }}
                  ></div>

                  <div
                    className="chart-bar"
                    style={{ height: "50%" }}
                  ></div>

                  <div
                    className="chart-bar"
                    style={{ height: "75%" }}
                  ></div>

                  <div
                    className="chart-bar"
                    style={{ height: "65%" }}
                  ></div>

                  <div
                    className="chart-bar"
                    style={{ height: "90%" }}
                  ></div>

                </div>


                {/* Chart labels */}
                <div className="chart-labels">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;