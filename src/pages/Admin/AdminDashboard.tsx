import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StatsCard from '../../components/StatsCard/StatsCard';
import ReportsTable from '../../components/ReportsTable/ReportsTable';
import { Incident, AdminAction, User } from '../../utils/types';
import { getStatusColor, formatDate } from '../../utils/helpers';
import { mockUsers } from '../../utils/data';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filteredReports, setFilteredReports] = useState<Incident[]>([]);
  const [selectedReport, setSelectedReport] = useState<Incident | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'activity'>('overview');
  const [statusChangeNotes, setStatusChangeNotes] = useState('');
  const [selectedReportForStatus, setSelectedReportForStatus] = useState<Incident | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [activityLogs, setActivityLogs] = useState<AdminAction[]>([]);

  const { user } = useAuth();
  const { getAllReports, updateReport, deleteReport } = useReports();

  const allReports = useMemo(() => getAllReports(), []);

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

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(report =>
        new Date(report.createdOn).toDateString() === filterDate.toDateString()
      );
    }

    setFilteredReports(filtered);
  }, [searchTerm, typeFilter, statusFilter, dateFilter, allReports]);

  const stats = {
    totalReports: allReports.length,
    redFlags: allReports.filter(r => r.type === 'red-flag').length,
    interventions: allReports.filter(r => r.type === 'intervention').length,
    resolved: allReports.filter(r => r.status === 'resolved').length,
    underInvestigation: allReports.filter(r => r.status === 'under investigation').length,
    draft: allReports.filter(r => r.status === 'draft').length,
    rejected: allReports.filter(r => r.status === 'rejected').length,
    todayReports: allReports.filter(r =>
      new Date(r.createdOn).toDateString() === new Date().toDateString()
    ).length,
    weeklyReports: allReports.filter(r => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(r.createdOn) >= weekAgo;
    }).length,
  };

  const getUserName = (userId: number): string => {
    const foundUser = mockUsers.find(u => u.id === userId);
    return foundUser ? `${foundUser.firstname} ${foundUser.lastname}` : 'Unknown User';
  };

  const handleStatusChange = (reportId: number, newStatusValue: string, notes: string = '') => {
    const report = allReports.find(r => r.id === reportId);
    if (!report || !user) return;

    const action: AdminAction = {
      id: `action_${Date.now()}`,
      adminId: user.id,
      adminName: `${user.firstname} ${user.lastname}`,
      action: 'status_change',
      reportId,
      oldStatus: report.status,
      newStatus: newStatusValue,
      timestamp: new Date(),
      notes,
    };

    const updatedActions = [...(report.adminActions || []), action];

    updateReport(reportId, {
      status: newStatusValue as any,
      lastModifiedBy: user.id,
      lastModifiedAt: new Date(),
      adminActions: updatedActions,
    });

    setActivityLogs([...activityLogs, action]);
    setSelectedReportForStatus(null);
    setNewStatus('');
    setStatusChangeNotes('');
    alert(`Report status updated to "${newStatusValue}"`);
  };

  const handleDeleteReport = (reportId: number) => {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;

    if (window.confirm(`Are you sure you want to delete "${report.title}"? This action cannot be undone.`)) {
      const success = deleteReport(reportId);
      if (success) {
        const action: AdminAction = {
          id: `action_${Date.now()}`,
          adminId: user?.id || 0,
          adminName: user ? `${user.firstname} ${user.lastname}` : 'Admin',
          action: 'status_change',
          reportId,
          timestamp: new Date(),
          notes: 'Report deleted',
        };
        setActivityLogs([...activityLogs, action]);
        alert('Report deleted successfully!');
      } else {
        alert('Failed to delete report. Please try again.');
      }
    }
  };

  const handleViewReport = (report: Incident) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const getStatusDistribution = () => {
    const statusCounts = {
      draft: stats.draft,
      'under investigation': stats.underInvestigation,
      resolved: stats.resolved,
      rejected: stats.rejected,
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: stats.totalReports > 0 ? (count / stats.totalReports) * 100 : 0,
      color: getStatusColor(status),
    }));
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

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setDateFilter('');
  };

  const recentActivities = activityLogs.slice().reverse().slice(0, 10);

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
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h1 className="welcome-title">Admin Dashboard</h1>
              <p className="welcome-subtitle">
                Welcome back, {user?.firstname}! Manage reports and monitor platform activity.
              </p>
            </div>
            <div className="welcome-stats">
              <div className="stat-badge">
                <span className="stat-number">{stats.todayReports}</span>
                <span className="stat-label">Today</span>
              </div>
              <div className="stat-badge">
                <span className="stat-number">{stats.weeklyReports}</span>
                <span className="stat-label">This Week</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="admin-tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              📋 All Reports
            </button>
            <button
              className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              📝 Activity Log
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-content">
              {/* Key Metrics */}
              <div className="metrics-grid">
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

              {/* Status Distribution */}
              <div className="admin-section">
                <h2 className="section-title">Status Distribution</h2>
                <div className="status-distribution">
                  {getStatusDistribution().map((item) => (
                    <div key={item.status} className="status-dist-item">
                      <div className="status-info">
                        <div
                          className="status-color"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="status-name">{item.status}</span>
                        <span className="status-count">{item.count}</span>
                      </div>
                      <div className="status-bar">
                        <div
                          className="status-fill"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <span className="status-percentage">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="admin-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                  <div className="quick-action-card">
                    <div className="action-icon">🚩</div>
                    <h3>Red Flag Reports</h3>
                    <p>Manage corruption reports</p>
                    <span className="action-count">{stats.redFlags} reports</span>
                  </div>
                  <div className="quick-action-card">
                    <div className="action-icon">⚙️</div>
                    <h3>Intervention Requests</h3>
                    <p>Handle government interventions</p>
                    <span className="action-count">{stats.interventions} requests</span>
                  </div>
                  <div className="quick-action-card">
                    <div className="action-icon">🔍</div>
                    <h3>Under Investigation</h3>
                    <p>Review ongoing investigations</p>
                    <span className="action-count">{stats.underInvestigation} cases</span>
                  </div>
                  <div className="quick-action-card">
                    <div className="action-icon">📈</div>
                    <h3>Platform Analytics</h3>
                    <p>View detailed analytics</p>
                    <span className="action-count">View Report</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="reports-content">
              {/* Filters */}
              <div className="filters-section">
                <div className="filters-header">
                  <h3>Report Filters</h3>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Report Type</label>
                    <select
                      className="filter-select"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="red-flag">Red Flags</option>
                      <option value="intervention">Interventions</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Status</label>
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

                  <div className="filter-group">
                    <label>Date</label>
                    <input
                      type="date"
                      className="filter-select"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Results</label>
                    <div className="results-count">
                      {filteredReports.length} reports found
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports Table */}
              <div className="admin-section">
                <ReportsTable
                  reports={filteredReports}
                  showActions={true}
                  isAdmin={true}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteReport}
                  onView={handleViewReport}
                />
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="activity-content">
              <div className="admin-section">
                <h2 className="section-title">Admin Activity Log</h2>
                <div className="activity-log">
                  {recentActivities.length > 0 ? (
                    <div className="activity-list">
                      {recentActivities.map((log) => (
                        <div key={log.id} className="activity-item">
                          <div className="activity-icon">
                            {log.action === 'status_change' ? '📝' : '👁️'}
                          </div>
                          <div className="activity-details">
                            <div className="activity-header">
                              <span className="activity-admin">{log.adminName}</span>
                              <span className="activity-action">
                                {log.action === 'status_change' ? 'Changed status' : 'Viewed report'}
                              </span>
                            </div>
                            <div className="activity-info">
                              <span className="activity-report">Report ID: {log.reportId}</span>
                              {log.oldStatus && log.newStatus && (
                                <span className="activity-status">
                                  {log.oldStatus} → <span className="status-highlight">{log.newStatus}</span>
                                </span>
                              )}
                              {log.notes && (
                                <span className="activity-notes">Notes: {log.notes}</span>
                              )}
                            </div>
                            <div className="activity-time">
                              {formatDate(new Date(log.timestamp))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📭</div>
                      <h3>No activity yet</h3>
                      <p>Admin activity logs will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Details</h2>
              <button
                className="modal-close"
                onClick={() => setShowReportModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="report-detail">
                <div className="detail-row">
                  <label>Title:</label>
                  <span>{selectedReport.title}</span>
                </div>
                <div className="detail-row">
                  <label>Type:</label>
                  <span className={`report-type ${selectedReport.type}`}>
                    {selectedReport.type.replace('-', ' ')}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Current Status:</label>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: `${getStatusColor(selectedReport.status)}20`,
                      color: getStatusColor(selectedReport.status),
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                    }}
                  >
                    {selectedReport.status}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Date Created:</label>
                  <span>{formatDate(new Date(selectedReport.createdOn))}</span>
                </div>
                <div className="detail-row">
                  <label>Created By:</label>
                  <span>{getUserName(selectedReport.createdBy)}</span>
                </div>
                <div className="detail-row">
                  <label>Location:</label>
                  <span>{selectedReport.location}</span>
                </div>
                <div className="detail-row full-width">
                  <label>Description:</label>
                  <p>{selectedReport.comment}</p>
                </div>
                {selectedReport.adminActions && selectedReport.adminActions.length > 0 && (
                  <div className="detail-row full-width">
                    <label>Admin Actions:</label>
                    <div className="admin-actions-list">
                      {selectedReport.adminActions.map((action) => (
                        <div key={action.id} className="admin-action-item">
                          <span className="action-by">{action.adminName}</span>
                          <span className="action-type">
                            {action.oldStatus} → {action.newStatus}
                          </span>
                          <span className="action-date">
                            {formatDate(new Date(action.timestamp))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Change Section */}
              <div className="status-change-section">
                <h3>Change Report Status</h3>
                <div className="status-change-form">
                  <select
                    className="status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">Select new status...</option>
                    <option value="draft">Draft</option>
                    <option value="under investigation">Under Investigation</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <textarea
                    className="status-notes"
                    placeholder="Add optional notes..."
                    value={statusChangeNotes}
                    onChange={(e) => setStatusChangeNotes(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (newStatus) {
                        handleStatusChange(selectedReport.id, newStatus, statusChangeNotes);
                        setShowReportModal(false);
                      } else {
                        alert('Please select a status');
                      }
                    }}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowReportModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
