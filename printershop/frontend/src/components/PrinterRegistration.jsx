import  { useState } from 'react';
import './PrinterRegistration.css';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    email: '',
    mobile: '',
    password: '',
    specs: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration Submitted:', formData);
    // Add your API integration here (e.g., fetch or axios call)
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>
        <p>Fill in the details below to register your shop.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shopName">Shop Name</label>
            <input
              type="text"
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="Print Hub"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="specs">Specs</label>
            <select
              id="specs"
              name="specs"
              value={formData.specs}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select hardware specification</option>
              <option value="bw-with-scanner">Black and white-only with scanner</option>
              <option value="color-with-scanner">Color with scanner</option>
              <option value="bw-without-scanner">B&W without scanner</option>
              <option value="color-without-scanner">Color without scanner</option>
              <option value="scanner-only">Scanner only</option>
            </select>
          </div>

          <button type="submit" className="btn-submit">Register</button>
        </form>

        <div className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
}