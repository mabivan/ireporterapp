import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useReports } from "../../context/ReportContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import StatsCard from "../../components/StatsCard/StatsCard";
import ReportsTable from "../../components/ReportsTable/ReportsTable";
import UsersTable from "../../components/UsersTable/Userstable"; // You'll need to create this
import { Incident, User } from "../../utils/types";
import { getStatusColor, formatDate } from "../../utils/helpers";
import {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  activateUser,
  getUserStats,
  searchUsers,
  UserStats,
} from "../../api/usersApi";
import "./AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [filteredReports, setFilteredReports] = useState<Incident[]>([]);
  const [selectedReport, setSelectedReport] = useState<Incident | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "users">(
    "overview"
  );

  // User management states
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { getAllReports, updateReport, deleteReport } = useReports();

  const allReports = getAllReports();

  // Load reports data
  useEffect(() => {
    let filtered = allReports;

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((report) => report.type === typeFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(
        (report) =>
          new Date(report.createdOn).toDateString() ===
          filterDate.toDateString()
      );
    }

    setFilteredReports(filtered);
  }, [searchTerm, typeFilter, statusFilter, dateFilter, allReports]);

  // Load users data when users tab is active
  useEffect(() => {
    if (activeTab === "users") {
      loadUsersData();
    }
  }, [activeTab]);

  // Filter users based on search
  useEffect(() => {
    if (userSearchTerm) {
      const filtered = users.filter(
        (user) =>
          user.firstname.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.lastname.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [userSearchTerm, users]);

  const loadUsersData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getUserStats(),
      ]);
      setUsers(usersData);
      setFilteredUsers(usersData);
      setUserStats(statsData);
    } catch (error) {
      console.error("Failed to load users data:", error);
      alert("Failed to load users data");
    } finally {
      setLoading(false);
    }
  };

  // Statistics calculations for reports
  const stats = {
    totalReports: allReports.length,
    redFlags: allReports.filter((r) => r.type === "red-flag").length,
    interventions: allReports.filter((r) => r.type === "intervention").length,
    resolved: allReports.filter((r) => r.status === "resolved").length,
    underInvestigation: allReports.filter(
      (r) => r.status === "under investigation"
    ).length,
    draft: allReports.filter((r) => r.status === "draft").length,
    rejected: allReports.filter((r) => r.status === "rejected").length,
    todayReports: allReports.filter(
      (r) => new Date(r.createdOn).toDateString() === new Date().toDateString()
    ).length,
    weeklyReports: allReports.filter((r) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(r.createdOn) >= weekAgo;
    }).length,
  };

  const handleStatusChange = (reportId: number, newStatus: string) => {
    updateReport(reportId, { status: newStatus as any });
  };

  const handleDeleteReport = (reportId: number) => {
    const report = allReports.find((r) => r.id === reportId);
    if (!report) return;

    if (
      window.confirm(
        `Are you sure you want to delete "${report.title}"? This action cannot be undone.`
      )
    ) {
      const success = deleteReport(reportId);
      if (success) {
        alert("Report deleted successfully!");
      } else {
        alert("Failed to delete report. Please try again.");
      }
    }
  };

  const handleViewReport = (report: Incident) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  // User management handlers
  const handleRoleChange = async (userId: number, isAdmin: boolean) => {
    try {
      await updateUserRole(userId, isAdmin);
      // Update local state
      setUsers(
        users.map((user) => (user.id === userId ? { ...user, isAdmin } : user))
      );
      alert(
        `User ${isAdmin ? "promoted to admin" : "demoted to user"} successfully!`
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
      alert("Failed to update user role");
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        await deactivateUser(userId);
        await loadUsersData(); // Reload data
        alert("User deactivated successfully!");
      } catch (error) {
        console.error("Failed to deactivate user:", error);
        alert("Failed to deactivate user");
      }
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      await activateUser(userId);
      await loadUsersData(); // Reload data
      alert("User activated successfully!");
    } catch (error) {
      console.error("Failed to activate user:", error);
      alert("Failed to activate user");
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (query.trim()) {
      setLoading(true);
      try {
        const searchResults = await searchUsers(query);
        setFilteredUsers(searchResults);
      } catch (error) {
        console.error("Search failed:", error);
        // Fallback to local filtering
        const filtered = users.filter(
          (user) =>
            user.firstname.toLowerCase().includes(query.toLowerCase()) ||
            user.lastname.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredUsers(filtered);
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredUsers(users);
    }
  };

  const getStatusDistribution = () => {
    const statusCounts = {
      draft: stats.draft,
      "under investigation": stats.underInvestigation,
      resolved: stats.resolved,
      rejected: stats.rejected,
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: (count / stats.totalReports) * 100,
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
    setSearchTerm("");
    setTypeFilter("");
    setStatusFilter("");
    setDateFilter("");
  };

  const clearUserSearch = () => {
    setUserSearchTerm("");
    setFilteredUsers(users);
  };

  return (
    <div className="admin-dashboard">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        mobileOpen={isMobileOpen}
        onMobileClose={handleMobileClose}
      />

      <div className={`admin-main ${isSidebarCollapsed ? "collapsed" : ""}`}>
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
                Welcome back, {user?.firstname}! Manage all reports and monitor
                platform activity.
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
              className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📊 Overview
            </button>
            <button
              className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              📋 All Reports
            </button>
            <button
              className={`tab-button ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              👥 User Management
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="overview-content">
              {/* Key Metrics */}
              <div className="metrics-grid">
                <StatsCard
                  title="Total Reports"
                  value={stats.totalReports}
                  type="red-flag"
                  icon="📊"
                  change={10}
                />
                <StatsCard
                  title="Red Flags"
                  value={stats.redFlags}
                  type="red-flag"
                  icon="🚩"
                  change={5}
                />
                <StatsCard
                  title="Interventions"
                  value={stats.interventions}
                  type="intervention"
                  icon="⚙️"
                  change={8}
                />
                <StatsCard
                  title="Resolved"
                  value={stats.resolved}
                  type="resolved"
                  icon="✅"
                  change={15}
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
                      <span className="status-percentage">
                        {item.percentage.toFixed(1)}%
                      </span>
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
                    <span className="action-count">
                      {stats.redFlags} reports
                    </span>
                  </div>
                  <div className="quick-action-card">
                    <div className="action-icon">⚙️</div>
                    <h3>Intervention Requests</h3>
                    <p>Handle government interventions</p>
                    <span className="action-count">
                      {stats.interventions} requests
                    </span>
                  </div>
                  <div className="quick-action-card">
                    <div className="action-icon">🔍</div>
                    <h3>Under Investigation</h3>
                    <p>Review ongoing investigations</p>
                    <span className="action-count">
                      {stats.underInvestigation} cases
                    </span>
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
          {activeTab === "reports" && (
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
                      <option value="under investigation">
                        Under Investigation
                      </option>
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

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="users-content">
              <div className="admin-section">
                <div className="section-header">
                  <h2 className="section-title">User Management</h2>
                  <div className="user-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={loadUsersData}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Refresh"}
                    </button>
                  </div>
                </div>

                {/* User Stats */}
                {userStats && (
                  <div className="users-stats">
                    <div className="user-stat-card">
                      <div className="user-stat-icon">👥</div>
                      <div className="user-stat-info">
                        <div className="user-stat-number">
                          {userStats.totalUsers}
                        </div>
                        <div className="user-stat-label">Total Users</div>
                      </div>
                    </div>
                    <div className="user-stat-card">
                      <div className="user-stat-icon">👑</div>
                      <div className="user-stat-info">
                        <div className="user-stat-number">
                          {userStats.adminUsers}
                        </div>
                        <div className="user-stat-label">Admin Users</div>
                      </div>
                    </div>
                    <div className="user-stat-card">
                      <div className="user-stat-icon">📝</div>
                      <div className="user-stat-info">
                        <div className="user-stat-number">
                          {userStats.usersWithReports}
                        </div>
                        <div className="user-stat-label">Active Reporters</div>
                      </div>
                    </div>
                    <div className="user-stat-card">
                      <div className="user-stat-icon">🔄</div>
                      <div className="user-stat-info">
                        <div className="user-stat-number">
                          {userStats.newUsersThisWeek}
                        </div>
                        <div className="user-stat-label">New This Week</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Search */}
                <div className="user-search-section">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search users by name, email, or username..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSearchUsers(userSearchTerm)}
                      disabled={loading}
                    >
                      Search
                    </button>
                    {userSearchTerm && (
                      <button
                        className="btn btn-secondary"
                        onClick={clearUserSearch}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Users Table */}
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <UsersTable
                    users={filteredUsers}
                    onRoleChange={handleRoleChange}
                    onDeactivate={handleDeactivateUser}
                    onActivate={handleActivateUser}
                    currentUserId={user?.id} // Prevent self-modification
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <div
          className="modal-overlay"
          onClick={() => setShowReportModal(false)}
        >
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
                    {selectedReport.type.replace("-", " ")}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: `${getStatusColor(selectedReport.status)}20`,
                      color: getStatusColor(selectedReport.status),
                      border: `1px solid ${getStatusColor(selectedReport.status)}`,
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
                  <label>Location:</label>
                  <span>{selectedReport.location}</span>
                </div>
                <div className="detail-row full-width">
                  <label>Description:</label>
                  <p>{selectedReport.comment}</p>
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
