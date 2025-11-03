import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../../components/HeroSection/HeroSection";
import FeaturesSection from "../../components/FeaturesSection/FeaturesSection";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import StatsSection from "../../components/StatsSection/StatsSection";
import logo from "../../assets/ireportlogo.png";
import "./Landing.css";
import { useAuth } from "../../context/AuthContext";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const { isAuthenticated, user, loading, logout } = useAuth();

  // ✅ Clear session if not "remember me"
  useEffect(() => {
    if (isAuthenticated) {
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      if (!rememberMe) {
        logout(); // clears sessionStorage but keeps localStorage if rememberMe was set
      }
    }
  }, [isAuthenticated]);

  // ✅ Header scroll effect
  useEffect(() => {
    const handleScroll = () => setIsHeaderScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Navigation helper
  const handleNavigation = (path: string) => {
    if (isAuthenticated && (path === "/login" || path === "/signup")) {
      navigate(user?.isAdmin ? "/admin" : "/dashboard");
      return;
    }
    navigate(path);
  };

  const handleGetStarted = () => handleNavigation("/signup");
  const handleReportNow = () => handleNavigation("/login");

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Header */}
      <header
        className={`landing-header ${isHeaderScrolled ? "scrolled" : ""}`}
      >
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img
                src={logo}
                alt="VoiceUp Africa Logo"
                className="logo-image"
              />
              <span className="logo-text">VoiceUp Africa</span>
            </div>

            <nav className="nav-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#impact">Impact</a>
            </nav>

            <div className="header-actions">
              <div className="auth-buttons">
                {!isAuthenticated ? (
                  <>
                    <button
                      className="landing-btn landing-btn-outline"
                      onClick={() => handleNavigation("/login")}
                    >
                      Login
                    </button>
                    <button
                      className="landing-btn landing-btn-primary"
                      onClick={() => handleNavigation("/signup")}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <button
                    className="landing-btn landing-btn-primary"
                    onClick={() =>
                      navigate(user?.isAdmin ? "/admin" : "/dashboard")
                    }
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <HeroSection
          onGetStarted={
            isAuthenticated ? () => navigate("/dashboard") : handleGetStarted
          }
          onReportNow={
            isAuthenticated ? () => navigate("/dashboard") : handleReportNow
          }
        />

        <FeaturesSection />
        <HowItWorks />
        <StatsSection />

        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Make a Difference?</h2>
              <p>
                Join thousands of citizens fighting corruption and improving
                public services
              </p>
              <div className="cta-buttons">
                <button
                  className="landing-btn landing-btn-secondary landing-btn-large"
                  onClick={
                    isAuthenticated
                      ? () => navigate("/dashboard")
                      : handleGetStarted
                  }
                >
                  {isAuthenticated ? "Go to Dashboard" : "Create Account"}
                </button>
                <button
                  className="landing-btn landing-btn-outline landing-btn-large"
                  onClick={
                    isAuthenticated
                      ? () => navigate("/dashboard")
                      : handleReportNow
                  }
                >
                  {isAuthenticated ? "View Reports" : "Learn More"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <img
                  src={logo}
                  alt="VoiceUp Africa Logo"
                  className="logo-image"
                />
                <span className="logo-text">VoiceUp Africa</span>
              </div>
              <p className="footer-description">
                Empowering citizens across Africa to report corruption and
                demand accountability from government officials.
              </p>
              <div className="social-links">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            <div className="footer-links-group">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#how-it-works">How It Works</a>
                </li>
                <li>
                  <a href="#impact">Impact</a>
                </li>
                <li>
                  <a href="#security">Security</a>
                </li>
              </ul>
            </div>

            <div className="footer-newsletter">
              <h4>Stay Connected</h4>
              <p>Get updates on resolved cases and new features.</p>
              <form className="newsletter-form">
                <input
                  type="email"
                  placeholder="Your email address"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="landing-btn landing-btn-primary"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; {new Date().getFullYear()} VoiceUp Africa. All rights
              reserved.
            </p>
            <p>Transparency and accountability in Africa</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
