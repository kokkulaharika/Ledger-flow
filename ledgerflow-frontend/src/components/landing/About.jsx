import React from "react";
import "./landing.css";

function About() {
  return (
    <section className="landing-section about-section" id="about">

      <div className="landing-section-container">

        <div className="about-content">

          <div className="about-text">

            <span className="section-label">
              ABOUT LEDGERFLOW
            </span>

            <h2>
              Built to make
              <span> business management simpler.</span>
            </h2>

            <p>
              LedgerFlow is a centralized business management platform
              designed to simplify the way businesses handle their
              everyday operations.
            </p>

            <p>
              Instead of managing billing, inventory, sales, purchases,
              customers, suppliers, expenses, and reports separately,
              LedgerFlow brings everything together in one connected
              platform.
            </p>

            <button className="about-button">
              Get Started
              <i className="fa-solid fa-arrow-right"></i>
            </button>

          </div>

          <div className="about-highlight">

            <div className="about-logo">
              <i className="fa-solid fa-layer-group"></i>
            </div>

            <h3>LedgerFlow</h3>

            <p>
              Smart Billing. Seamless Inventory.
              Better Business.
            </p>

            <div className="about-divider"></div>

            <div className="about-values">

              <div>
                <i className="fa-solid fa-bolt"></i>
                <span>Efficiency</span>
              </div>

              <div>
                <i className="fa-solid fa-chart-line"></i>
                <span>Visibility</span>
              </div>

              <div>
                <i className="fa-solid fa-shield-halved"></i>
                <span>Reliability</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default About;