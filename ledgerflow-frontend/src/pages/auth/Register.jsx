import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Import the Axios API instance.
// Because Register.jsx is inside pages/auth, we go two levels up.
import api from "../../api/api";

// Import authentication page styles.
import "./auth.css";

function Register() {
  // Used to navigate the user to another page after registration.
  const navigate = useNavigate();

  // Store all registration form values.
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    businessType: "",
    email: "",
    password: "",
  });

  // Store API or validation error messages.
  const [error, setError] = useState("");

  // Store the loading state while registration is processing.
  const [loading, setLoading] = useState(false);

  // Controls whether the password is visible or hidden.
  const [showPassword, setShowPassword] = useState(false);

  // Handle changes in all form inputs.
  const handleChange = (event) => {
    const { name, value } = event.target;

    // Update only the field that was changed.
    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Remove the previous error when the user starts typing again.
    setError("");
  };

  // Handle registration form submission.
  const handleSubmit = async (event) => {
    // Prevent the browser from refreshing the page.
    event.preventDefault();

    // Clear any previous error.
    setError("");

    // Start the loading state.
    setLoading(true);

    try {
      // Send the exact fields expected by the LedgerFlow backend.
      const response = await api.post("/auth/register", formData);

      // Get the JWT token returned by the backend.
      const token = response.data.token;

      // Save the token so authenticated API requests can use it later.
      localStorage.setItem("token", token);

      // Save the logged-in user's information.
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Redirect the user to the dashboard after successful registration.
      navigate("/dashboard");
    } catch (err) {
      // Display the backend error message if one is available.
      const message =
        err.response?.data?.message ||
        "Registration failed. Please try again.";

      setError(message);
    } finally {
      // Stop the loading state whether registration succeeds or fails.
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* ================================
            LEFT BRANDING SECTION
            ================================ */}
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

          {/* Main branding message */}
          <div className="auth-brand-message">
            <h1>
              Manage your business
              <span> smarter.</span>
            </h1>

            <p>
              Manage billing, inventory, sales, purchases,
              customers and expenses from one powerful platform.
            </p>
          </div>

          {/* Small feature highlights */}
          <div className="auth-benefits">

            <div className="auth-benefit">
              <i className="fa-solid fa-chart-line"></i>
              <span>Real-time business insights</span>
            </div>

            <div className="auth-benefit">
              <i className="fa-solid fa-boxes-stacked"></i>
              <span>Simple inventory management</span>
            </div>

            <div className="auth-benefit">
              <i className="fa-solid fa-file-invoice-dollar"></i>
              <span>Easy billing and invoicing</span>
            </div>

          </div>
        </section>

        {/* ================================
            RIGHT REGISTRATION SECTION
            ================================ */}
        <section className="auth-form-section">

          <div className="auth-card">

            {/* Mobile-only brand */}
            <div className="auth-mobile-logo">
              <div className="auth-brand-icon">
                <i className="fa-solid fa-layer-group"></i>
              </div>

              <span>LedgerFlow</span>
            </div>

            {/* Form heading */}
            <div className="auth-card-header">
              <h1>Create your account</h1>

              <p>
                Get started with LedgerFlow today.
              </p>
            </div>

            {/* Display API errors */}
            {error && (
              <div className="auth-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Registration form */}
            <form onSubmit={handleSubmit}>

              {/* Full Name */}
              <div className="auth-input-group">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <div className="auth-input-wrapper">
                  <i className="fa-solid fa-user"></i>

                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Business Name */}
              <div className="auth-input-group">
                <label htmlFor="businessName">
                  Business Name
                </label>

                <div className="auth-input-wrapper">
                  <i className="fa-solid fa-building"></i>

                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Business Type */}
              <div className="auth-input-group">
                <label htmlFor="businessType">
                  Business Type
                </label>

                <div className="auth-input-wrapper">
                  <i className="fa-solid fa-briefcase"></i>

                  <input
                    type="text"
                    id="businessType"
                    name="businessType"
                    placeholder="e.g. Retail, Wholesale, Services"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="auth-input-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="auth-input-wrapper">
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

              {/* Password */}
              <div className="auth-input-group">
                <label htmlFor="password">
                  Password
                </label>

                <div className="auth-input-wrapper">

                  {/* Password lock icon */}
                  <i className="fa-solid fa-lock"></i>

                  {/* Password visibility changes between text/password */}
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Create a password"
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

              {/* Submit button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <div className="auth-switch">
              <span>Already have an account?</span>

              <Link to="/login">
                Login
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

export default Register;