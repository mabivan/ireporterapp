import React from 'react';
import { Incident } from '../../utils/types';
import { getStatusColor, formatDate } from '../../utils/helpers';
import './ReportsTable.css';

interface ReportsTableProps {
  reports: Incident[];
  showActions?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onStatusChange?: (id: number, status: string) => void;
  isAdmin?: boolean;
}

const ReportsTable: React.FC<ReportsTableProps> = ({ 
  reports, 
  showActions = false, 
  onEdit, 
  onDelete,
  onStatusChange,
  isAdmin = false 
}) => {
  const canEditOrDelete = (report: Incident) => {
    return report.status === 'draft';
  };

  const getStatusOptions = (currentStatus: string) => {
    const options = [
      { value: 'under investigation', label: 'Under Investigation' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'rejected', label: 'Rejected' }
    ];
    
    return options.filter(option => option.value !== currentStatus);
  };

  const mobileHeaders = [
    'ID', 'Report', 'Type', 'Status', 'Date', 'Actions'
  ];

  return (
    <div className="reports-table">
      {/* Desktop Header */}
      <div className="table-header">
        <div>ID</div>
        <div>Report Details</div>
        <div>Type</div>
        <div>Status</div>
        <div>Date</div>
        {showActions && <div>Actions</div>}
      </div>

      {reports.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 20px' }}>
          <div className="empty-icon">📝</div>
          <h3 className="empty-title">No reports found</h3>
          <p className="empty-description">
            No reports match your current filters.
          </p>
        </div>
      ) : (
        reports.map((report, index) => (
          <div key={report.id} className="table-row">
            {/* Report ID */}
            <div 
              className="table-cell report-id" 
              data-label="ID"
            >
              #{report.id}
            </div>

            {/* Report Details */}
            <div 
              className="table-cell" 
              data-label="Report Details"
            >
              <div>
                <div className="report-title">{report.title}</div>
                <div className="report-description">
                  {report.comment}
                </div>
              </div>
            </div>

            {/* Report Type */}
            <div 
              className="table-cell" 
              data-label="Type"
            >
              <span className={`report-type ${report.type}`}>
                {report.type.replace('-', ' ')}
              </span>
            </div>

            {/* Status */}
            <div 
              className="table-cell" 
              data-label="Status"
            >
              {isAdmin && onStatusChange ? (
                <select
                  value={report.status}
                  onChange={(e) => onStatusChange(report.id, e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: `2px solid ${getStatusColor(report.status)}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: 'white',
                    color: getStatusColor(report.status),
                    cursor: 'pointer'
                  }}
                >
                  <option value={report.status} style={{ color: getStatusColor(report.status) }}>
                    {report.status}
                  </option>
                  {getStatusOptions(report.status).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span 
                  className="report-status"
                  style={{
                    backgroundColor: `${getStatusColor(report.status)}20`,
                    color: getStatusColor(report.status),
                    border: `1px solid ${getStatusColor(report.status)}`
                  }}
                >
                  {report.status}
                </span>
              )}
            </div>

            {/* Date */}
            <div 
              className="table-cell report-date" 
              data-label="Date"
            >
              {formatDate(new Date(report.createdOn))}
            </div>

            {/* Actions */}
            {showActions && (
              <div 
                className="table-cell table-actions" 
                data-label="Actions"
              >
                <button
                  className="action-btn edit"
                  onClick={() => onEdit?.(report.id)}
                  disabled={!canEditOrDelete(report)}
                  title={canEditOrDelete(report) ? "Edit report" : "Cannot edit resolved/investigation reports"}
                >
                  Edit
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => onDelete?.(report.id)}
                  disabled={!canEditOrDelete(report)}
                  title={canEditOrDelete(report) ? "Delete report" : "Cannot delete resolved/investigation reports"}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReportsTable;