import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface Props {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  const farmId = typeof window !== 'undefined' ? localStorage.getItem('farmId') : null;
  const path = location.pathname;
  // Allow access to select-farm page even without farmId
  if (!farmId && path !== '/select-farm') {
    return <Navigate to="/select-farm" replace />;
  }
  return children;
};

export default ProtectedRoute;
