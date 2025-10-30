import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: `+256${Math.floor(100000000 + Math.random() * 899999999)}`, // hidden auto-filled
    password: "",
    confirmPassword: "",
    username: `user${Math.floor(Math.random() * 10000)}`, // hidden
    othernames: "", // hidden
  });

  const [isAdminRegistration, setIsAdminRegistration] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdminCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminCode(e.target.value);
  };

  const handleAdminToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isAdmin = e.target.checked;
    setIsAdminRegistration(isAdmin);
    setAdminCode(""); // Clear admin code when toggling
    if (!isAdmin) setError(""); // Clear admin-related errors
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isAdminRegistration && !adminCode) {
      setError("Admin registration code is required");
      return;
    }

    if (isAdminRegistration && adminCode !== "ADMIN_2024") {
      setError("Invalid admin registration code");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;

      // Add required isActive field for TypeScript
      const userDataWithRole = {
        ...userData,
        isAdmin: isAdminRegistration,
        isActive: true, // required field
      };

      const success = await signup(userDataWithRole);

      if (success) {
        navigate(isAdminRegistration ? "/admin/dashboard" : "/dashboard");
      } else {
        setError("Email already exists");
      }
    } catch {
      setError("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">iReporter</div>
          <p>Fighting corruption together!</p>
        </div>

        <h2 className="auth-title">Create Account</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="firstname"
                className="form-input"
                value={formData.firstname}
                onChange={handleChange}
                required
                placeholder="First name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastname"
                className="form-input"
                value={formData.lastname}
                onChange={handleChange}
                required
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <div className="form-group admin-toggle">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAdminRegistration}
                onChange={handleAdminToggle}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              Register as Administrator
            </label>
            <small className="admin-hint">
              Check this if you need administrator access
            </small>
          </div>

          {isAdminRegistration && (
            <div className="form-group admin-code-section">
              <label className="form-label">Admin Registration Code</label>
              <input
                type="password"
                className="form-input"
                value={adminCode}
                onChange={handleAdminCodeChange}
                required={isAdminRegistration}
                placeholder="Enter admin registration code"
              />
              <small className="admin-code-hint">
                Contact system administrator to get the registration code
              </small>
            </div>
          )}

          <input type="hidden" name="username" value={formData.username} />
          <input type="hidden" name="othernames" value={formData.othernames} />
          <input
            type="hidden"
            name="phoneNumber"
            value={formData.phoneNumber}
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
