import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/UserLoginPage';
import RegisterForm from './components/userreg';
import UserDashboard from './components/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // Import the new component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<RegisterForm />} />
        
        {/* Wrap the UserDashboard with the ProtectedRoute */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;