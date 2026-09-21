import React from "react";
import "./landing.css";

function Solutions() {
  return (
    <section className="landing-section solutions-section" id="solutions">

      <div className="landing-section-container">

        <div className="solutions-content">

          <div className="solutions-text">

            <span className="section-label">
              SOLUTIONS
            </span>

            <h2>
              One platform for your
              <span> entire business.</span>
            </h2>

            <p>
              From managing your products and customers to tracking
              sales, purchases, expenses, and profitability, LedgerFlow
              keeps your business operations connected.
            </p>

            <div className="solution-list">

              <div className="solution-item">
                <i className="fa-solid fa-circle-check"></i>
                <span>Manage sales and purchases</span>
              </div>

              <div className="solution-item">
                <i className="fa-solid fa-circle-check"></i>
                <span>Track inventory and stock levels</span>
              </div>

              <div className="solution-item">
                <i className="fa-solid fa-circle-check"></i>
                <span>Manage customers and suppliers</span>
              </div>

              <div className="solution-item">
                <i className="fa-solid fa-circle-check"></i>
                <span>Monitor expenses and profitability</span>
              </div>

            </div>

          </div>

          <div className="solutions-visual">

            <div className="solution-main-card">

              <div className="solution-card-header">
                <span>
                  <i className="fa-solid fa-chart-pie"></i>
                </span>

                <div>
                  <small>Business Overview</small>
                  <strong>₹1,25,000</strong>
                </div>
              </div>

              <div className="solution-stats">

                <div>
                  <small>Sales</small>
                  <strong>84</strong>
                </div>

                <div>
                  <small>Products</small>
                  <strong>342</strong>
                </div>

                <div>
                  <small>Profit</small>
                  <strong>₹35K</strong>
                </div>

              </div>

              <div className="solution-bars">

                <div style={{ height: "45%" }}></div>
                <div style={{ height: "60%" }}></div>
                <div style={{ height: "50%" }}></div>
                <div style={{ height: "75%" }}></div>
                <div style={{ height: "65%" }}></div>
                <div style={{ height: "90%" }}></div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Solutions;