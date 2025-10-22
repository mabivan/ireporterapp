import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ReportProvider } from './context/ReportContext';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Profile from './pages/Profile/Profile';
import CreateReport from './pages/CreateReport/CreateReport';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to={user?.isAdmin ? "/admin" : "/dashboard"} replace /> 
            : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/login" 
        element={
          !isAuthenticated ? <Login /> : <Navigate to={user?.isAdmin ? "/admin" : "/dashboard"} replace />
        } 
      />
      <Route 
        path="/signup" 
        element={
          !isAuthenticated ? <Signup /> : <Navigate to={user?.isAdmin ? "/admin" : "/dashboard"} replace />
        } 
      />
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
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-report" 
        element={
          <ProtectedRoute>
            <CreateReport />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/edit-report/:reportId" 
        element={
          <ProtectedRoute>
            <CreateReport />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

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

export default App;