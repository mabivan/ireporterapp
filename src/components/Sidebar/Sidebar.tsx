import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  mobileOpen, 
  onMobileClose 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNavItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/red-flags', icon: '🚩', label: 'My Red-Flags' },
    { path: '/interventions', icon: '⚙️', label: 'My Interventions' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const adminNavItems = [
    { path: '/admin', icon: '📋', label: 'All Reports' },
    { path: '/admin/red-flags', icon: '🚩', label: 'Red-Flags' },
    { path: '/admin/interventions', icon: '⚙️', label: 'Interventions' },
    { path: '/admin/users', icon: '👥', label: 'Manage Users' },
    { path: '/admin/analytics', icon: '📊', label: 'Analytics' },
  ];

  const navItems = user?.isAdmin ? adminNavItems : userNavItems;

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="mobile-overlay"
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
        />
      )}

      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-toggle" onClick={onToggle}>
          {isCollapsed ? '→' : '←'}
        </div>

        <div className="sidebar-header">
          <div className="sidebar-logo">iReporter</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;