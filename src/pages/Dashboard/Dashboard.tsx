import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StatsCard from '../../components/StatsCard/StatsCard';
import ReportsTable from '../../components/ReportsTable/ReportsTable';
import { Incident } from '../../utils/types';
import { getStatusColor, formatDate } from '../../utils/helpers';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState<Incident[]>([]);

  const { user } = useAuth();
  const { getUserReports } = useReports();
  
  const userReports = getUserReports(user?.id || 0);

  useEffect(() => {
    const filtered = userReports.filter(report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchTerm, userReports]);

  const stats = {
    totalReports: userReports.length,
    redFlags: userReports.filter(r => r.type === 'red-flag').length,
    interventions: userReports.filter(r => r.type === 'intervention').length,
    resolved: userReports.filter(r => r.status === 'resolved').length,
    pending: userReports.filter(r => 
      r.status === 'draft' || r.status === 'under investigation'
    ).length,
    rejected: userReports.filter(r => r.status === 'rejected').length,
  };

  const recentReports = userReports
    .sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())
    .slice(0, 5);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleMobileClose = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="dashboard">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        mobileOpen={isMobileOpen}
        onMobileClose={handleMobileClose}
      />
      
      <div className={`dashboard-main ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <Header
          title="Dashboard"
          onMenuToggle={handleMobileMenuToggle}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome back, {user?.firstname}!
            </h1>
            <p className="welcome-subtitle">
              Here's what's happening with your reports today.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="stats-grid">
            <StatsCard
              title="Total Reports"
              value={stats.totalReports}
              type="red-flag"
              icon="📊"
            />
            <StatsCard
              title="Red Flags"
              value={stats.redFlags}
              type="red-flag"
              icon="🚩"
            />
            <StatsCard
              title="Interventions"
              value={stats.interventions}
              type="intervention"
              icon="⚙️"
            />
            <StatsCard
              title="Resolved"
              value={stats.resolved}
              type="resolved"
              icon="✅"
            />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <Link to="/create-report?type=red-flag" className="action-btn">
              <span>🚩</span>
              Report Corruption
            </Link>
            <Link to="/create-report?type=intervention" className="action-btn">
              <span>⚙️</span>
              Request Intervention
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <div className="section-header">
              <h2 className="section-title">Recent Reports</h2>
              <Link to="/my-reports" className="view-all">
                View All Reports
              </Link>
            </div>

            {recentReports.length > 0 ? (
              <ReportsTable 
                reports={recentReports} 
                showActions={true}
                onEdit={(id) => console.log('Edit:', id)}
                onDelete={(id) => console.log('Delete:', id)}
              />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3 className="empty-title">No reports yet</h3>
                <p className="empty-description">
                  Start by creating your first report to fight corruption or request government intervention.
                </p>
                <Link to="/create-report" className="btn btn-primary">
                  Create First Report
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;