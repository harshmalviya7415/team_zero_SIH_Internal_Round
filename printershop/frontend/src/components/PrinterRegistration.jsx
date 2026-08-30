import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PrinterRegistration.css';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    shopname: '',
    email: '',
    mobile: '',
    college: '',
    services: [],
    pagesizes: [],
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => {
      const list = prev[name] || [];
      if (checked) {
        return {
          ...prev,
          [name]: [...list, value]
        };
      } else {
        return {
          ...prev,
          [name]: list.filter((item) => item !== value)
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.services || formData.services.length === 0) {
      alert("Please select at least one Service Type.");
      return;
    }
    if (!formData.pagesizes || formData.pagesizes.length === 0) {
      alert("Please select at least one Supported Page Size.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:1500/api/printer/create", formData, {
        withCredentials: true
      });

      if (response.data.mess) {
        alert(response.data.mess);
      } else {
        alert("Registration Successful!");
        setFormData({
          fullname: '',
          shopname: '',
          email: '',
          mobile: '',
          college: '',
          services: [],
          pagesizes: [],
          password: ''
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred during registration. Please try again.");
    }
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
            <label>Services Provided</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="services"
                  value="Black and White"
                  checked={formData.services.includes("Black and White")}
                  onChange={handleCheckboxChange}
                />
                Black and White
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="services"
                  value="Colour"
                  checked={formData.services.includes("Colour")}
                  onChange={handleCheckboxChange}
                />
                Colour
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Supported Page Sizes</label>
            <div className="checkbox-group grid-checkboxes">
              {["A4", "A3", "A2", "A1", "A0"].map((size) => (
                <label className="checkbox-label" key={size}>
                  <input
                    type="checkbox"
                    name="pagesizes"
                    value={size}
                    checked={formData.pagesizes.includes(size)}
                    onChange={handleCheckboxChange}
                  />
                  {size}
                </label>
              ))}
            </div>
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