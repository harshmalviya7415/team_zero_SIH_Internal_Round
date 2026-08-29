import { useState } from "react";
import "./PrinterLoginPage.css";

// Accept the onSwitch prop here
export default function LoginPage({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signing in:", { email, password });
    // Add your login API call here
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
              id="password"
              type="password"
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
          Don't have an account?{" "}
          {/* Trigger onSwitch when clicked */}
          <a href="#" onClick={(e) => {
            e.preventDefault();
            onSwitch();
          }}>
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}