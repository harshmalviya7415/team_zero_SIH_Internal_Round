import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PrinterLoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:1500/api/printer/login", { email, password }, {
        withCredentials: true
      });

      if (response.data.mess) {
        alert(response.data.mess);
      } else {
        alert("Login Successful!");
        localStorage.setItem("printer", JSON.stringify(response.data));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Welcome Back</h2>
        <p>Sign in to access your dashboard and manage your print jobs.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Sign In
          </button>
        </form>

        <p className="login-link">
          Don't have an account?{' '}
          <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}