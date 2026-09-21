import React from "react";
import { Link } from "react-router-dom";

// Import the existing landing page stylesheet.
// The navbar styles are already inside landing.css.
import "./landing.css";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Main navbar container */}
      <div className="navbar-container">

        {/* =================================
            LEDGERFLOW BRAND
            ================================= */}
        <Link to="/" className="brand">

          {/* Brand icon */}
          <div className="brand-icon">
            <i className="fa-solid fa-layer-group"></i>
          </div>

          {/* Brand name */}
          <span className="brand-name">
            LedgerFlow
          </span>

        </Link>


        {/* =================================
            NAVIGATION LINKS
            ================================= */}
        <div className="nav-links">

          {/* Navigate to Features section */}
          <a href="#features">
            Features
          </a>

          {/* Navigate to Solutions section */}
          <a href="#solutions">
            Solutions
          </a>

          {/* Navigate to How It Works section */}
          <a href="#how-it-works">
            How It Works
          </a>

          {/* Navigate to About section */}
          <a href="#about">
            About
          </a>

        </div>


        {/* =================================
            AUTHENTICATION ACTIONS
            ================================= */}
        <div className="nav-actions">

          {/* Navigate to Login page */}
          <Link to="/login" className="login-btn">
            Login
          </Link>

          {/* Navigate to Register page */}
          <Link to="/register" className="nav-cta">
            Get Started

            {/* Arrow icon */}
            <i className="fa-solid fa-arrow-right"></i>
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;