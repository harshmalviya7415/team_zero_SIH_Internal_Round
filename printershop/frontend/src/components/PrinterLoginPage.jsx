import { useState } from "react";
import "./PrinterLoginPage.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signing in:", { username, password });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Welcome Back</h2>
        <p>Sign in to access your dashboard and manage your print jobs.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
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
          Don't have an account?
          <a href="#">Create one</a>
        </p>
      </div>
    </div>
  );
}