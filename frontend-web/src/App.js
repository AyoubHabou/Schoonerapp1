import React from 'react';
import ResetPassword from './components/auth/ResetPassword';
import ForgotPassword from './components/auth/ForgotPassword';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import InvitedRegistration from './components/auth/InvitedRegistration';
import TimeClock from './components/employee/TimeClock';
import Dashboard from './components/manager/Dashboard';
import { CssBaseline, Box, ThemeProvider, createTheme } from '@mui/material';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('timetracker_token');
  
  // Get user from token (simplified)
  const getUser = () => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };
  
  const user = getUser();
  
  if (!token || !user) {
    // Not logged in
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    // Not authorized for this role
    return <Navigate to={user.role === 'manager' ? '/dashboard' : '/time-clock'} />;
  }
  
  return children;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    background: {
      default: '#f5f5f5'
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/register/:token" element={<InvitedRegistration />} />
              <Route 
                path="/time-clock" 
                element={
                  <ProtectedRoute requiredRole="employee">
                    <TimeClock />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requiredRole="manager">
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;