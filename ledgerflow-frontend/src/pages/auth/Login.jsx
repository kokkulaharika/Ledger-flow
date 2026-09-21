import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Import the Axios API instance.
// Login.jsx is inside pages/auth, so we go two levels up.
import api from "../../api/api";

// Reuse the authentication page styles.
import "./auth.css";

function Login() {
  // Used to redirect the user after successful login.
  const navigate = useNavigate();

  // Store login form values.
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Store API error messages.
  const [error, setError] = useState("");

  // Track whether the login request is running.
  const [loading, setLoading] = useState(false);

  // Control whether the password is visible.
  const [showPassword, setShowPassword] = useState(false);

  // Handle changes in the email and password fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    // Update only the input field that changed.
    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Clear the previous error when the user starts typing.
    setError("");
  };

  // Handle login form submission.
  const handleSubmit = async (event) => {
    // Prevent the browser from refreshing the page.
    event.preventDefault();

    // Clear previous errors.
    setError("");

    // Start loading state.
    setLoading(true);

    try {
      // Send the exact fields expected by the backend.
      const response = await api.post("/auth/login", formData);

      // The backend returns the JWT using the "token" property.
      const token = response.data.token;

      // Save the token for authenticated API requests.
      localStorage.setItem("token", token);

      // Save the logged-in user's information.
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Redirect to the dashboard after successful login.
      navigate("/dashboard");
    } catch (err) {
  // Print the complete error in the browser console.
  console.error("LOGIN ERROR:", err);

  // Print the response returned by the backend, if available.
  console.log("BACKEND RESPONSE:", err.response?.data);

  // Print the HTTP status code, if available.
  console.log("STATUS CODE:", err.response?.status);

  // Show the backend error message to the user.
  const message =
    err.response?.data?.message ||
    "Login failed. Please check your backend connection.";

  setError(message);
}
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* =================================
            LEFT BRANDING SECTION
            ================================= */}
        <section className="auth-brand-section">

          {/* LedgerFlow brand */}
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <i className="fa-solid fa-layer-group"></i>
            </div>

            <div className="auth-brand-content">
              <h2>LedgerFlow</h2>
              <p>Billing & Inventory SaaS</p>
            </div>
          </div>

          {/* Main login message */}
          <div className="auth-brand-message">
            <h1>
              Welcome
              <span> back.</span>
            </h1>

            <p>
              Continue managing your billing, inventory,
              sales and business operations with LedgerFlow.
            </p>
          </div>

          {/* Login benefits */}
          <div className="auth-benefits">

            <div className="auth-benefit">
              <i className="fa-solid fa-chart-line"></i>
              <span>Monitor your business performance</span>
            </div>

            <div className="auth-benefit">
              <i className="fa-solid fa-boxes-stacked"></i>
              <span>Track inventory in real time</span>
            </div>

            <div className="auth-benefit">
              <i className="fa-solid fa-file-invoice-dollar"></i>
              <span>Manage invoices and payments</span>
            </div>

          </div>
        </section>

        {/* =================================
            RIGHT LOGIN SECTION
            ================================= */}
        <section className="auth-form-section">

          <div className="auth-card">

            {/* Mobile LedgerFlow logo */}
            <div className="auth-mobile-logo">
              <div className="auth-brand-icon">
                <i className="fa-solid fa-layer-group"></i>
              </div>

              <span>LedgerFlow</span>
            </div>

            {/* Login heading */}
            <div className="auth-card-header">
              <h1>Welcome back</h1>

              <p>
                Login to your LedgerFlow account.
              </p>
            </div>

            {/* Display login errors */}
            {error && (
              <div className="auth-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit}>

              {/* Email field */}
              <div className="auth-input-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="auth-input-wrapper">

                  {/* Email icon */}
                  <i className="fa-solid fa-envelope"></i>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="auth-input-group">
                <label htmlFor="password">
                  Password
                </label>

                <div className="auth-input-wrapper">

                  {/* Password lock icon */}
                  <i className="fa-solid fa-lock"></i>

                  {/* Change input type when password visibility changes */}
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  {/* View / Hide password button */}
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((previousValue) => !previousValue)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <i
                      className={
                        showPassword
                          ? "fa-solid fa-eye-slash"
                          : "fa-solid fa-eye"
                      }
                    ></i>
                  </button>

                </div>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    {/* Loading spinner */}
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Logging in...
                  </>
                ) : (
                  <>
                    {/* Login text */}
                    Login

                    {/* Arrow icon */}
                    <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </button>

            </form>

            {/* Register link */}
            <div className="auth-switch">
              <span>Don't have an account?</span>

              <Link to="/register">
                Create Account
              </Link>
            </div>

            {/* Back to landing page */}
            <Link to="/" className="auth-back">
              <i className="fa-solid fa-arrow-left"></i>
              Back to LedgerFlow
            </Link>

          </div>
        </section>

      </div>
    </div>
  );
}

export default Login;