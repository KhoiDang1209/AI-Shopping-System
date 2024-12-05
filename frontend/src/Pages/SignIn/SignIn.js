import React, { useState } from "react";
import "./SignIn.css";
import amazon_logo from "../../Assets/amazon_logo_black.png";
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios for making API requests
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const SignIn = () => {

  const [message, setMessage] = useState(''); // To display success or error messages
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone_number_or_email: '', // Can be either username or email
    password: '',
  });

  const handleChange = (e) => {
    console.log('Field:', e.target.name, 'Value:', e.target.value);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Event handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.phone_number_or_email || !formData.password) {
      setMessage('Please enter both username/email and password.');
      return;
    }

    try {
      // Sending login request to the backend
      console.log(formData);
      const response = await axios.post('http://localhost:8000/login', formData);

      console.log('Login successful:', response.data);
      setMessage('Login successful!'); // Display success message
      navigate('/LoginVerifyEmail', { state: { userData: { ...response.data.user } } });
      // Redirect or further actions after successful login
      // Example: navigate('/dashboard');
    } catch (error) {
      setMessage(
        error.response?.data?.detail || 'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <div className="signin-container">
      <Link to="/">
        <img src={amazon_logo} alt="Amazon Logo" className="signin-logo" />
      </Link>
      <div className="signin-box">
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="phone_number_or_email">Phone number or email</label>
          <input
            type="text"
            id="phone_number_or_email"
            name="phone_number_or_email"
            value={formData.phone_number_or_email}
            placeholder="Enter your email or mobile number"
            required
            onChange={handleChange}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            placeholder="Password must be at least 8 characters, include one uppercase letter and one special character"
            required
            onChange={handleChange}
          />
          <button type="submit" className="signin-button">
            Sign In
          </button>
          {message && <p className="message">{message}</p>}
          <p className="agreement-text">
            By creating an account, you agree to Amazon's{" "}
            <a href="#">Conditions of Use</a> and{" "}
            <a href="#">Privacy Notice</a>.
          </p>
        </form>

        <p className="signin-prompt">
          Create your Amazon account{" "}
          <a href="/SignUp" className="signup-link">
            Sign Up
          </a>
        </p>
      </div>

      <footer>
        <div className="footer-links">
          <a href="#">Conditions of Use</a>
          <a href="#">Privacy Notice</a>
          <a href="#">Help</a>
        </div>
        <p>© 1996-2024, Amazon.com, Inc. or its affiliates</p>
      </footer>
    </div>
  );
};

export default SignIn;
