import  { useState } from 'react';
import './userreg.css';

export default function RegisterForm({ onSwitch }) {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    mobile: '',
    college: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = 'Full Name is required';
    if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Enter a valid 10-digit mobile number';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email address';
    if (!formData.college.trim()) newErrors.college = 'College is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const dataToSend = {
        ...formData,
        mobile: Number(formData.mobile) 
      };

      console.log('User Registered:', dataToSend);
      alert('Registration Successful!');
      
      setFormData({ fullname: '', email: '', mobile: '', college: '', password: '' });
      setErrors({});
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>
        <p>Please enter your details to register.</p>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              id="fullname"
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Your Name"
            />
            {errors.fullname && <span className="error-text">{errors.fullname}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email ID</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="yourname@example.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile No.</label>
            <input
              id="mobile"
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="1234567890"
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="college">College</label>
            <input
              id="college"
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="Enter your college name"
            />
            {errors.college && <span className="error-text">{errors.college}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-submit">
            Register
          </button>
        </form>

        <div className="login-link">
          Already have an account?{' '}
          <a href="#" onClick={(e) => {
            e.preventDefault();
            onSwitch();
          }}>
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}