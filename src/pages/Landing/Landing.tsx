import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../../components/HeroSection/HeroSection';
import FeaturesSection from '../../components/FeaturesSection/FeaturesSection';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import StatsSection from '../../components/StatsSection/StatsSection';
import './Landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleReportNow = () => {
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className={`landing-header ${isHeaderScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">📍</span>
              <span className="logo-text">iReporter</span>
            </div>
            
            <nav className="nav-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#impact">Impact</a>
            </nav>

            <div className="header-actions">
              <div className="auth-buttons">
                <button 
                  className="btn btn-outline" 
                  onClick={() => handleNavigation('/login')}
                >
                  Login
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleNavigation('/signup')}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <HeroSection 
          onGetStarted={handleGetStarted}
          onReportNow={handleReportNow}
        />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Stats Section */}
        <StatsSection />

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Make a Difference?</h2>
              <p>Join thousands of citizens fighting corruption and improving public services</p>
              <div className="cta-buttons">
                <button 
                  className="btn btn-secondary btn-large" 
                  onClick={handleGetStarted}
                >
                  Create Account
                </button>
                <button 
                  className="btn btn-outline btn-large" 
                  onClick={handleReportNow}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo">
                <span className="logo-icon">📍</span>
                <span className="logo-text">iReporter</span>
              </div>
              <p className="footer-description">
                Empowering citizens across Africa to report corruption and demand accountability from government officials.
              </p>
              <div className="social-links">
                <a href="#twitter" aria-label="Twitter">𝕏</a>
                <a href="#facebook" aria-label="Facebook">f</a>
                <a href="#linkedin" aria-label="LinkedIn">in</a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
              <a href="#security">Security</a>
            </div>

            <div className="footer-section">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#careers">Careers</a>
              <a href="#blog">Blog</a>
              <a href="#contact">Contact</a>
            </div>

            <div className="footer-section">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
              <a href="#disclaimer">Disclaimer</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 iReporter. All rights reserved.</p>
            <p>Made with ❤️ for transparency and accountability in Africa</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
