import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the user data exists in local storage
  const isAuthenticated = localStorage.getItem("user");

  if (!isAuthenticated) {
    // If no user is found, redirect them to the login page immediately
    // 'replace' prevents them from using the back button to return here
    return <Navigate to="/login" replace />;
  }

  // If the user exists, render the requested component (e.g., Dashboard)
  return children;
};

export default ProtectedRoute;