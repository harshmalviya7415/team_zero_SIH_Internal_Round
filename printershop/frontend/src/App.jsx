import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "./components/PrinterRegistration.jsx";
import LoginPage from "./components/PrinterLoginPage.jsx";
import PrinterDashboard from "./components/PrinterDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterForm />} />
        <Route path="/dashboard" element={<PrinterDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;