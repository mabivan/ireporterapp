import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StatsCard from '../../components/StatsCard/StatsCard';
import ReportsTable from '../../components/ReportsTable/ReportsTable';
import { Incident } from '../../utils/types';
import { getStatusColor } from '../../utils/helpers';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredReports, setFilteredReports] = useState<Incident[]>([]);

  const { user } = useAuth();
  const { getAllReports, updateReport } = useReports();
  
  const allReports = getAllReports();

  useEffect(() => {
    let filtered = allReports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  }, [searchTerm, typeFilter, statusFilter, allReports]);

  const stats = {
    totalReports: allReports.length,
    redFlags: allReports.filter(r => r.type === 'red-flag').length,
    interventions: allReports.filter(r => r.type === 'intervention').length,
    resolved: allReports.filter(r => r.status === 'resolved').length,
    underInvestigation: allReports.filter(r => r.status === 'under investigation').length,
    draft: allReports.filter(r => r.status === 'draft').length,
    rejected: allReports.filter(r => r.status === 'rejected').length,
  };

  const handleStatusChange = (reportId: number, newStatus: string) => {
    updateReport(reportId, { status: newStatus as any });
  };

  const handleDeleteReport = (reportId: number) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      console.log('Delete report:', reportId);
    }
  };

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
    <div className="admin-dashboard">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        mobileOpen={isMobileOpen}
        onMobileClose={handleMobileClose}
      />
      
      <div className={`admin-main ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <Header
          title="Admin Dashboard"
          onMenuToggle={handleMobileMenuToggle}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <div className="admin-content">
          <div className="welcome-section">
            <h1 className="welcome-title">
              Admin Dashboard
            </h1>
            <p className="welcome-subtitle">
              Manage all reports and monitor platform activity.
            </p>
          </div>

          <div className="admin-stats-grid">
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

          <div className="admin-section">
            <h2 className="section-title">Reports Overview</h2>
            
            <div className="status-overview">
              <div className="status-item">
                <div 
                  className="status-color" 
                  style={{ backgroundColor: getStatusColor('draft') }}
                />
                <div className="status-info">
                  <div className="status-count">{stats.draft}</div>
                  <div className="status-label">Draft</div>
                </div>
              </div>
              
              <div className="status-item">
                <div 
                  className="status-color" 
                  style={{ backgroundColor: getStatusColor('under investigation') }}
                />
                <div className="status-info">
                  <div className="status-count">{stats.underInvestigation}</div>
                  <div className="status-label">Under Investigation</div>
                </div>
              </div>
              
              <div className="status-item">
                <div 
                  className="status-color" 
                  style={{ backgroundColor: getStatusColor('resolved') }}
                />
                <div className="status-info">
                  <div className="status-count">{stats.resolved}</div>
                  <div className="status-label">Resolved</div>
                </div>
              </div>
              
              <div className="status-item">
                <div 
                  className="status-color" 
                  style={{ backgroundColor: getStatusColor('rejected') }}
                />
                <div className="status-info">
                  <div className="status-count">{stats.rejected}</div>
                  <div className="status-label">Rejected</div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">All Reports</h2>
              <div className="filters">
                <select
                  className="filter-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="red-flag">Red Flags</option>
                  <option value="intervention">Interventions</option>
                </select>
                
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="under investigation">Under Investigation</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <ReportsTable 
              reports={filteredReports}
              showActions={true}
              isAdmin={true}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteReport}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;