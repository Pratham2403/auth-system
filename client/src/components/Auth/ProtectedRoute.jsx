import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { getCurrentUser } from '../../redux/slices/authSlice';

/**
 * Protected Route Component
 * Ensures that only authenticated users can access certain routes
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {Array} props.allowedRoles - Optional array of roles allowed to access the route
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  
  useEffect(() => {
    // If not authenticated, try to get current user
    if (!isAuthenticated && !loading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, loading]);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If authenticated and has required role, render children
  return children;
};

export default ProtectedRoute;