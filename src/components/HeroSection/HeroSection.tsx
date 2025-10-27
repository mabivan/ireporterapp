import React from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  onGetStarted: () => void;
  onReportNow: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onReportNow }) => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Fight Corruption.
              <span className="gradient-text"> Improve Public Services.</span>
              <br />
              Make Your Voice Heard.
            </h1>
            <p className="hero-subtitle">
              iReporter empowers ordinary citizens across Africa to report corruption cases 
              and public service issues directly to relevant authorities. Join the movement 
              for transparency and accountability.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-large" onClick={onGetStarted}>
                🚀 Get Started
              </button>
              <button className="btn btn-secondary btn-large" onClick={onReportNow}>
                📢 Report an Issue
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Reports Filed</div>
              </div>
              <div className="stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">Issues Resolved</div>
              </div>
              <div className="stat">
                <div className="stat-number">50+</div>
                <div className="stat-label">African Cities</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">🚩</div>
              <div className="card-text">Red Flag Reported</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">⚙️</div>
              <div className="card-text">Intervention Requested</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">✅</div>
              <div className="card-text">Issue Resolved</div>
            </div>
            <div className="hero-image">
              <div className="map-background">
                <div className="location-pin pin-1">📍</div>
                <div className="location-pin pin-2">📍</div>
                <div className="location-pin pin-3">📍</div>
                <div className="location-pin pin-4">📍</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
