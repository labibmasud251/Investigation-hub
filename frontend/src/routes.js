import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewInvestigation from './pages/NewInvestigation';
import InvestigationDetails from './pages/InvestigationDetails';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import SubmitReport from './pages/SubmitReport';
import InvestigationRequests from './pages/InvestigationRequests';
import InvestigatorInvestigations from './pages/InvestigatorInvestigations';

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Client Route Component
export const ClientRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.roles?.includes('client')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Investigator Route Component
export const InvestigatorRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.roles?.includes('investigator')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Routes
export const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '*', element: <NotFound /> }
];

// Protected Routes
export const protectedRoutes = [
  { 
    path: '/dashboard', 
    element: <ProtectedRoute><Dashboard /></ProtectedRoute> 
  },
  { 
    path: '/profile', 
    element: <ProtectedRoute><Profile /></ProtectedRoute> 
  },
  { 
    path: '/investigations/new', 
    element: <ClientRoute><NewInvestigation /></ClientRoute> 
  },
  { 
    path: '/investigations/:id', 
    element: <ProtectedRoute><InvestigationDetails /></ProtectedRoute> 
  },
  { 
    path: '/investigations/:id/submit-report', 
    element: <InvestigatorRoute><SubmitReport /></InvestigatorRoute> 
  },
  { 
    path: '/investigation-requests', 
    element: <InvestigatorRoute><InvestigationRequests /></InvestigatorRoute> 
  },
  { 
    path: '/my-investigations', 
    element: <InvestigatorRoute><InvestigatorInvestigations /></InvestigatorRoute> 
  }
]; 