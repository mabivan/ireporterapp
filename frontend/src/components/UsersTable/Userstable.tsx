import React from "react";
import { User } from "../../utils/types";
import "./UsersTable.css";

interface UsersTableProps {
  users: User[];
  onRoleChange: (userId: number, isAdmin: boolean) => void;
  onDeactivate: (userId: number) => void;
  onActivate: (userId: number) => void;
  currentUserId?: number;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onRoleChange,
  onDeactivate,
  onActivate,
  currentUserId,
}) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isCurrentUser = (userId: number) => {
    return userId === currentUserId;
  };

  return (
    <div className="users-table-container">
      <div className="table-responsive">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Username</th>
              <th>Role</th>
              <th>Registered</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-users">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={isCurrentUser(user.id) ? "current-user" : ""}
                >
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.firstname.charAt(0)}
                        {user.lastname.charAt(0)}
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          {user.firstname} {user.lastname}
                          {user.othernames && ` ${user.othernames}`}
                        </div>
                        <div className="user-id">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="user-email">{user.email}</div>
                      <div className="user-phone">{user.phoneNumber}</div>
                    </div>
                  </td>
                  <td>
                    <span className="username">@{user.username}</span>
                  </td>
                  <td>
                    <div className="role-section">
                      <span
                        className={`role-badge ${user.isAdmin ? "admin" : "user"}`}
                      >
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                      {!isCurrentUser(user.id) && (
                        <button
                          className="role-toggle-btn"
                          onClick={() => onRoleChange(user.id, !user.isAdmin)}
                          title={
                            user.isAdmin ? "Demote to User" : "Promote to Admin"
                          }
                        >
                          {user.isAdmin ? "👑" : "👤"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="registration-date">
                      {formatDate(user.registered)}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${user.isActive ? "active" : "inactive"}`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      {!isCurrentUser(user.id) && (
                        <>
                          {user.isActive ? (
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => onDeactivate(user.id)}
                              title="Deactivate User"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => onActivate(user.id)}
                              title="Activate User"
                            >
                              Activate
                            </button>
                          )}
                        </>
                      )}
                      {isCurrentUser(user.id) && (
                        <span className="current-user-label">You</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
