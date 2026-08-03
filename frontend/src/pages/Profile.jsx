import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address Form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Password Form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatNameFromEmail = (emailStr) => {
    if (!emailStr) return "User Profile";
    const prefix = emailStr.split("@")[0];
    const parts = prefix.split(/[._-]/).filter(Boolean);
    return parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users/profile");
      let uData = res.data.user || user;

      // If user name is single character 'a' or empty, auto-format a clean full name from their email address
      if (!uData.name || uData.name.trim().length <= 2 || uData.name === "a") {
        const formattedName = formatNameFromEmail(uData.email);
        uData.name = formattedName;
        // Optionally sync to backend silently
        API.put("/users/profile", { name: formattedName, email: uData.email }).catch(() => {});
      }

      setProfileData(uData);
      setName(uData.name || "");
      setEmail(uData.email || "");
      if (updateUser) updateUser(uData);
    } catch (err) {
      console.log(err);
      setMessage({ type: "error", text: "Failed to load user profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      setMessage({ type: "", text: "" });
      const res = await API.put("/users/profile", { name, email });
      setProfileData(res.data.user);
      if (updateUser) updateUser(res.data.user);
      setMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.postalCode || !address.phone) {
      setMessage({ type: "error", text: "Please fill in all address fields." });
      return;
    }

    try {
      setSavingAddress(true);
      setMessage({ type: "", text: "" });
      const res = await API.post("/users/address", address);
      setProfileData((prev) => ({
        ...prev,
        addresses: res.data.addresses,
      }));
      setAddress({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        phone: "",
      });
      setShowAddressForm(false);
      setMessage({ type: "success", text: "Delivery address added successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save address.",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      setUpdatingPassword(true);
      setMessage({ type: "", text: "" });
      await API.put("/users/password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      setMessage({ type: "success", text: "Password updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="profile-page-wrapper">
        <div className="profile-loading">
          <div className="profile-spinner"></div>
          <p>Loading profile details...</p>
        </div>
      </div>
    );
  }

  const initial = profileData?.name ? profileData.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* Banner / Header */}
        <div className="profile-header-card">
          {profileData?.avatar ? (
            <img
              src={profileData.avatar}
              alt={profileData.name}
              className="profile-avatar-photo"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="profile-avatar">{initial}</div>
          )}
          <div className="profile-user-info">
            <h2>{profileData?.name || "User Profile"}</h2>
            <p className="profile-email">📧 {profileData?.email}</p>
            <span className="profile-role-badge">
              {profileData?.role === "admin" ? "⚡ Admin Account" : "🛍️ Customer Account"}
            </span>
          </div>
          <button className="profile-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* System Message Alert */}
        {message.text && (
          <div className={`profile-alert ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: "", text: "" })}>✕</button>
          </div>
        )}

        {/* Quick Account Navigation Grid */}
        <div className="profile-shortcuts-grid">
          <Link to="/orders" className="shortcut-card">
            <div className="shortcut-icon">📦</div>
            <div className="shortcut-text">
              <h3>Your Orders</h3>
              <p>Track packages & view order history</p>
            </div>
          </Link>

          <Link to="/wishlist" className="shortcut-card">
            <div className="shortcut-icon">❤️</div>
            <div className="shortcut-text">
              <h3>Your Wishlist</h3>
              <p>View saved items & buy later</p>
            </div>
          </Link>

          <Link to="/cart" className="shortcut-card">
            <div className="shortcut-icon">🛒</div>
            <div className="shortcut-text">
              <h3>Shopping Cart</h3>
              <p>View & checkout cart items</p>
            </div>
          </Link>
        </div>

        {/* Main Content Layout */}
        <div className="profile-content-grid">
          {/* Left: Saved Delivery Addresses */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <h3>📍 Saved Delivery Addresses</h3>
              <button
                className="btn-action-primary"
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                {showAddressForm ? "Cancel" : "+ Add New Address"}
              </button>
            </div>

            {/* Address Add Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="profile-form address-form">
                <h4>New Delivery Address</h4>
                <div className="form-group">
                  <label>Street / Flat / House No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123 Main Street, Apt 4B"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chennai"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      placeholder="e.g. Tamil Nadu"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode / Postal Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 600001"
                      value={address.postalCode}
                      onChange={(e) =>
                        setAddress({ ...address, postalCode: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-submit-yellow"
                  disabled={savingAddress}
                >
                  {savingAddress ? "Saving..." : "Save Delivery Address"}
                </button>
              </form>
            )}

            {/* Address List */}
            <div className="addresses-list">
              {profileData?.addresses && profileData.addresses.length > 0 ? (
                profileData.addresses.map((addr, idx) => (
                  <div key={idx} className="address-item-card">
                    <div className="address-badge">Address #{idx + 1}</div>
                    <p className="address-street">
                      <b>{addr.street}</b>
                    </p>
                    <p className="address-location">
                      {addr.city}{addr.state ? `, ${addr.state}` : ""} - {addr.postalCode}
                    </p>
                    {addr.phone && <p className="address-phone">📞 {addr.phone}</p>}
                  </div>
                ))
              ) : (
                <div className="empty-address-box">
                  <p>No delivery address saved yet.</p>
                  <p className="subtext">
                    Add a saved address for faster 1-click checkout on your orders.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Personal Information & Security */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <h3>⚙️ Account Settings</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <h4>Personal Details</h4>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-submit-yellow"
                disabled={updatingProfile}
              >
                {updatingProfile ? "Updating..." : "Save Account Details"}
              </button>
            </form>

            <hr className="profile-divider" />

            <div className="security-section">
              <div className="security-header">
                <div>
                  <h4>Login & Security</h4>
                  <p>Update your password securely</p>
                </div>
                <button
                  className="btn-action-secondary"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  {showPasswordForm ? "Cancel" : "Change Password"}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="profile-form password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-submit-yellow"
                    disabled={updatingPassword}
                  >
                    {updatingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
