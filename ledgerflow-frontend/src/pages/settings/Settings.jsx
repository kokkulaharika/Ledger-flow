import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import "./settings.css";

const businessTypes = [
  "Retail Store",
  "Wholesale",
  "Restaurant",
  "Pharmacy",
  "Grocery",
  "Electronics",
  "Clothing",
  "Service",
  "Other",
];

const Settings = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    businessName: "",
    businessType: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [profileMessage, setProfileMessage] = useState({
    type: "",
    text: "",
  });

  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* =========================================================
     FETCH PROFILE
     ========================================================= */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");

        if (response.data.success) {
          const user = response.data.user;

          setProfile({
            fullName: user.fullName || "",
            email: user.email || "",
            businessName: user.businessName || "",
            businessType: user.businessType || "",
          });
        }
      } catch (error) {
        setProfileMessage({
          type: "error",
          text:
            error.response?.data?.message ||
            "Unable to load your profile.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* =========================================================
     PROFILE INPUT
     ========================================================= */

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setProfileMessage({
      type: "",
      text: "",
    });
  };

  /* =========================================================
     PASSWORD INPUT
     ========================================================= */

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPasswordMessage({
      type: "",
      text: "",
    });
  };

  /* =========================================================
     UPDATE PROFILE
     ========================================================= */

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileMessage({
      type: "",
      text: "",
    });

    if (
      !profile.fullName.trim() ||
      !profile.email.trim() ||
      !profile.businessName.trim() ||
      !profile.businessType
    ) {
      setProfileMessage({
        type: "error",
        text: "Please fill in all profile fields.",
      });

      return;
    }

    try {
      setProfileSaving(true);

      const response = await api.put("/auth/profile", {
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
        businessName: profile.businessName.trim(),
        businessType: profile.businessType,
      });

      if (response.data.success) {
        const updatedUser = response.data.user;

        setProfile({
          fullName: updatedUser.fullName || "",
          email: updatedUser.email || "",
          businessName: updatedUser.businessName || "",
          businessType: updatedUser.businessType || "",
        });

        /* Update stored user data */
        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        setProfileMessage({
          type: "success",
          text: "Profile updated successfully.",
        });
      }
    } catch (error) {
      setProfileMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to update your profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  /* =========================================================
     CHANGE PASSWORD
     ========================================================= */

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage({
      type: "",
      text: "",
    });

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordMessage({
        type: "error",
        text: "Please fill in all password fields.",
      });

      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });

      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match.",
      });

      return;
    }

    try {
      setPasswordSaving(true);

      const response = await api.put(
        "/auth/change-password",
        passwordData
      );

      if (response.data.success) {
        setPasswordMessage({
          type: "success",
          text: "Password changed successfully.",
        });

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to change your password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="settings-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="settings-sidebar">

        <Link
          to="/dashboard"
          className="settings-brand"
        >
          <div className="settings-brand-icon">
            <i className="fa-solid fa-chart-line"></i>
          </div>

          <span>LedgerFlow</span>
        </Link>

        <nav className="settings-navigation">

          <Link
            to="/dashboard"
            className="settings-nav-item"
          >
            <i className="fa-solid fa-house"></i>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/products"
            className="settings-nav-item"
          >
            <i className="fa-solid fa-box"></i>
            <span>Products</span>
          </Link>

          <Link
            to="/sales"
            className="settings-nav-item"
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Sales</span>
          </Link>

          <Link
            to="/purchases"
            className="settings-nav-item"
          >
            <i className="fa-solid fa-bag-shopping"></i>
            <span>Purchases</span>
          </Link>

          <Link
            to="/suppliers"
            className="settings-nav-item"
          >
            <i className="fa-solid fa-truck"></i>
            <span>Suppliers</span>
          </Link>

          <Link
            to="/customers"
            className="settings-nav-item"
          >
            <i className="fa-solid fa-users"></i>
            <span>Customers</span>
          </Link>

          <Link
            to="/invoices"
            className="settings-nav-item"
          >
            <i className="fa-solid fa-file-invoice"></i>
            <span>Invoices</span>
          </Link>

          <Link
            to="/expenses"
            className="settings-nav-item"
          >
            <i className="fa-solid fa-wallet"></i>
            <span>Expenses</span>
          </Link>

          <Link
            to="/reports"
            className="settings-nav-item"
          >
            <i className="fa-solid fa-chart-column"></i>
            <span>Reports</span>
          </Link>

          <Link
            to="/settings"
            className="settings-nav-item active"
          >
            <i className="fa-solid fa-gear"></i>
            <span>Settings</span>
          </Link>

        </nav>

        <div className="settings-sidebar-bottom">
          <button
            type="button"
            className="settings-nav-item logout-item"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>

      </aside>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="settings-main">

        {/* Header */}

        <header className="settings-header">

          <div>
            <p className="settings-page-label">
              Account Settings
            </p>

            <h1>Settings</h1>

            <p className="settings-header-description">
              Manage your LedgerFlow account and business information.
            </p>
          </div>

          <div className="settings-header-icon">
            <i className="fa-solid fa-gear"></i>
          </div>

        </header>


        {/* Content */}

        <div className="settings-content">


          {/* =================================================
              PROFILE
              ================================================= */}

          <section className="settings-panel">

            <div className="settings-panel-header">

              <div>
                <h2>Profile</h2>

                <p>
                  Update your personal account information.
                </p>
              </div>

              <div className="settings-panel-icon">
                <i className="fa-solid fa-user"></i>
              </div>

            </div>


            <form
              className="settings-form"
              onSubmit={handleProfileSubmit}
            >

              <div className="settings-form-grid">

                <div className="settings-field">

                  <label htmlFor="fullName">
                    Full Name
                  </label>

                  <div className="settings-input-wrapper">

                    <i className="fa-solid fa-user"></i>

                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                    />

                  </div>

                </div>


                <div className="settings-field">

                  <label htmlFor="email">
                    Email Address
                  </label>

                  <div className="settings-input-wrapper">

                    <i className="fa-solid fa-envelope"></i>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email"
                    />

                  </div>

                </div>

              </div>


              {profileMessage.text && (
                <div
                  className={`settings-message ${
                    profileMessage.type === "success"
                      ? "success-message"
                      : "error-message"
                  }`}
                >
                  <i
                    className={
                      profileMessage.type === "success"
                        ? "fa-solid fa-circle-check"
                        : "fa-solid fa-circle-exclamation"
                    }
                  ></i>

                  <span>{profileMessage.text}</span>
                </div>
              )}


              <div className="settings-form-actions">

                <button
                  type="submit"
                  className="settings-primary-btn"
                  disabled={profileSaving}
                >
                  {profileSaving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      Save Changes
                    </>
                  )}
                </button>

              </div>

            </form>

          </section>


          {/* =================================================
              BUSINESS INFORMATION
              ================================================= */}

          <section className="settings-panel">

            <div className="settings-panel-header">

              <div>
                <h2>Business Information</h2>

                <p>
                  Manage the business details connected to your account.
                </p>
              </div>

              <div className="settings-panel-icon">
                <i className="fa-solid fa-building"></i>
              </div>

            </div>


            <form
              className="settings-form"
              onSubmit={handleProfileSubmit}
            >

              <div className="settings-form-grid">

                <div className="settings-field">

                  <label htmlFor="businessName">
                    Business Name
                  </label>

                  <div className="settings-input-wrapper">

                    <i className="fa-solid fa-building"></i>

                    <input
                      id="businessName"
                      type="text"
                      name="businessName"
                      value={profile.businessName}
                      onChange={handleProfileChange}
                      placeholder="Enter business name"
                    />

                  </div>

                </div>


                <div className="settings-field">

                  <label htmlFor="businessType">
                    Business Type
                  </label>

                  <div className="settings-input-wrapper select-wrapper">

                    <i className="fa-solid fa-store"></i>

                    <select
                      id="businessType"
                      name="businessType"
                      value={profile.businessType}
                      onChange={handleProfileChange}
                    >
                      <option value="">
                        Select business type
                      </option>

                      {businessTypes.map((type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      ))}
                    </select>

                  </div>

                </div>

              </div>


              <div className="business-info-note">

                <i className="fa-solid fa-circle-info"></i>

                <span>
                  Your business information is used across
                  LedgerFlow for billing and inventory management.
                </span>

              </div>


              <div className="settings-form-actions">

                <button
                  type="submit"
                  className="settings-primary-btn"
                  disabled={profileSaving}
                >
                  {profileSaving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      Save Business Details
                    </>
                  )}
                </button>

              </div>

            </form>

          </section>


          {/* =================================================
              SECURITY
              ================================================= */}

          <section className="settings-panel security-panel">

            <div className="settings-panel-header">

              <div>
                <h2>Security</h2>

                <p>
                  Keep your LedgerFlow account secure by
                  regularly updating your password.
                </p>
              </div>

              <div className="settings-panel-icon security-icon">
                <i className="fa-solid fa-lock"></i>
              </div>

            </div>


            <form
              className="settings-form"
              onSubmit={handlePasswordSubmit}
            >

              <div className="password-form-grid">

                {/* Current Password */}

                <div className="settings-field">

                  <label htmlFor="currentPassword">
                    Current Password
                  </label>

                  <div className="settings-input-wrapper">

                    <i className="fa-solid fa-lock"></i>

                    <input
                      id="currentPassword"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowCurrentPassword(
                          !showCurrentPassword
                        )
                      }
                      aria-label={
                        showCurrentPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      <i
                        className={
                          showCurrentPassword
                            ? "fa-solid fa-eye-slash"
                            : "fa-solid fa-eye"
                        }
                      ></i>
                    </button>

                  </div>

                </div>


                {/* New Password */}

                <div className="settings-field">

                  <label htmlFor="newPassword">
                    New Password
                  </label>

                  <div className="settings-input-wrapper">

                    <i className="fa-solid fa-key"></i>

                    <input
                      id="newPassword"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowNewPassword(
                          !showNewPassword
                        )
                      }
                      aria-label={
                        showNewPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      <i
                        className={
                          showNewPassword
                            ? "fa-solid fa-eye-slash"
                            : "fa-solid fa-eye"
                        }
                      ></i>
                    </button>

                  </div>

                  <small>
                    Password must contain at least 8 characters.
                  </small>

                </div>


                {/* Confirm Password */}

                <div className="settings-field">

                  <label htmlFor="confirmPassword">
                    Confirm New Password
                  </label>

                  <div className="settings-input-wrapper">

                    <i className="fa-solid fa-key"></i>

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      <i
                        className={
                          showConfirmPassword
                            ? "fa-solid fa-eye-slash"
                            : "fa-solid fa-eye"
                        }
                      ></i>
                    </button>

                  </div>

                </div>

              </div>


              {passwordMessage.text && (
                <div
                  className={`settings-message ${
                    passwordMessage.type === "success"
                      ? "success-message"
                      : "error-message"
                  }`}
                >
                  <i
                    className={
                      passwordMessage.type === "success"
                        ? "fa-solid fa-circle-check"
                        : "fa-solid fa-circle-exclamation"
                    }
                  ></i>

                  <span>{passwordMessage.text}</span>
                </div>
              )}


              <div className="security-warning">

                <i className="fa-solid fa-shield-halved"></i>

                <div>
                  <strong>Password security</strong>

                  <p>
                    Your password is securely hashed before
                    being stored in the database.
                  </p>
                </div>

              </div>


              <div className="settings-form-actions">

                <button
                  type="submit"
                  className="settings-primary-btn"
                  disabled={passwordSaving}
                >
                  {passwordSaving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-lock"></i>
                      Change Password
                    </>
                  )}
                </button>

              </div>

            </form>

          </section>

        </div>

      </main>

    </div>
  );
};

export default Settings;