import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ReportProvider } from "./context/ReportContext";

// Pages
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Profile from "./pages/Profile/Profile";
import CreateReport from "./pages/CreateReport/CreateReport";
import EditReport from "./pages/EditReport/EditReport";
import Reports from "./pages/Reports/Reports";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
// ✅ ADD IMPORT
// ✅ ADD IMPORT
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ReportProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </ReportProvider>
      </AuthProvider>
    </Router>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Your existing routes remain EXACTLY the same */}
      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login />
          ) : (
            <Navigate
              to={user?.role === "admin" ? "/admin" : "/dashboard"}
              replace
            />
          )
        }
      />
      <Route
        path="/signup"
        element={
          !isAuthenticated ? (
            <Signup />
          ) : (
            <Navigate
              to={user?.role === "admin" ? "/admin" : "/dashboard"}
              replace
            />
          )
        }
      />
      {/* ... all your other existing routes remain unchanged */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      {/* ... rest of your routes */}
    </Routes>
  );
};

export default App;
