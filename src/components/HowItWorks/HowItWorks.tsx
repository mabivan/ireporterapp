import React from 'react';
import './HowItWorks.css';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: '📝',
      title: 'Create Your Report',
      description: 'Sign up and choose between reporting corruption (Red Flag) or requesting government intervention.',
      details: ['Select report type', 'Add title and description', 'Attach location and evidence']
    },
    {
      number: '02',
      icon: '📍',
      title: 'Provide Details & Location',
      description: 'Use our interactive map to pinpoint the exact location and add supporting evidence.',
      details: ['Mark location on map', 'Upload photos/videos', 'Add detailed description']
    },
    {
      number: '03',
      icon: '📤',
      title: 'Submit for Review',
      description: 'Your report is sent to relevant authorities and becomes visible to the public for transparency.',
      details: ['Automatic authority routing', 'Public visibility', 'Status tracking']
    },
    {
      number: '04',
      icon: '📊',
      title: 'Track Progress',
      description: 'Monitor your report status and receive updates as authorities investigate and resolve issues.',
      details: ['Real-time status updates', 'Authority responses', 'Resolution notifications']
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How iReporter Works</h2>
          <p className="section-subtitle">
            Four simple steps to report issues and create positive change in your community
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-indicator">
                <div className="step-number">{step.number}</div>
                <div className="step-connector"></div>
              </div>
              
              <div className="step-content">
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                
                <ul className="step-details">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="process-flow">
          <div className="flow-item">
            <div className="flow-icon">👤</div>
            <div className="flow-text">Citizen Reporter</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-item">
            <div className="flow-icon">📱</div>
            <div className="flow-text">iReporter Platform</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-item">
            <div className="flow-icon">🏛️</div>
            <div className="flow-text">Relevant Authorities</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-item">
            <div className="flow-icon">✅</div>
            <div className="flow-text">Issue Resolution</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
