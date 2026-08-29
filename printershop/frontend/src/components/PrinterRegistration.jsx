import { useState } from 'react';
import { Link } from 'react-router-dom';
import './PrinterRegistration.css';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    fullname: '',
    shopname: '',
    email: '',
    mobile: '',
    college: '',
    services: '',
    pagesizes: '',
    password: ''
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
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>
        <p>Fill in the details below to register your shop.</p>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shopname">Shop Name</label>
            <input
              type="text"
              id="shopname"
              name="shopname"
              value={formData.shopname}
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
              placeholder="1234567890"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="college">College</label>
            <input
              type="text"
              id="college"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="Enter your college name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="services">Services Provided</label>
            <select
              id="services"
              name="services"
              value={formData.services}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a service type</option>
              <option value="Black and White">Black and White</option>
              <option value="Colour">Colour</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pagesizes">Supported Page Sizes</label>
            <select
              id="pagesizes"
              name="pagesizes"
              value={formData.pagesizes}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select max page size</option>
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="A2">A2</option>
              <option value="A1">A1</option>
              <option value="A0">A0</option>
            </select>
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

          <button type="submit" className="btn-submit">Register</button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}