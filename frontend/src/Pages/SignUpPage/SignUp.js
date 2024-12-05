import React, { useState } from "react";
import "./SignUp.css";
import amazon_logo from "../../Assets/amazon_logo_black.png";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    email_address: '',
    phone_number: '',
    password: '',
    repassword: '',
    age: '',
    gender: '',
    city: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const validateAge = (age) => {
    const ageNumber = parseInt(age, 10);
    return ageNumber >= 0 && ageNumber <= 122;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.repassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (formData.age.trim() === "" || !validateAge(formData.age)) {
      setMessage("Please enter a valid age (0-122).");
      return;
    }

    // Basic validation for username
    if (!/^\w{3,50}$/.test(formData.user_name)) {
      setMessage("Invalid username.");
      return;
    }

    // Phone number validation
    if (!/^\d{10}$/.test(formData.phone_number)) {
      setMessage("Phone number must be 10 digits.");
      return;
    }

    // Password validation (at least 8 characters, one uppercase, one special character)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setMessage("Password must be at least 8 characters, include one uppercase letter and one special character.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/register', formData);
      console.log('Registration form send successful:', response.data);
      // Set a success message
      setMessage('Please check your mail');
      // Redirect to the VerifyEmail page, passing the email as state
      navigate('/signUpVerify', { state: { userData: { ...formData } } });
    } catch (error) {
      console.error('Error registering user:', error.response?.data || error.message);
      setMessage('Can not register at the moment. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <Link to="/">
        <img src={amazon_logo} alt="Amazon Logo" className="signup-logo" />
      </Link>
      <div className="signup-box">
        <h1>Create account</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="user_name">Your name</label>
          <input
            type="text"
            id="user_name"  // Change from 'name' to 'user_name'
            value={formData.user_name}
            placeholder="First and last name"
            required
            onChange={handleInputChange}
          />

          <label htmlFor="email_address">Email</label>
          <input
            type="email"
            id="email_address"  // Correct, this matches the 'email_address' key in formData
            value={formData.email_address}
            placeholder="Enter your email "
            required
            onChange={handleInputChange}
          />

          <label htmlFor="email_address">Phone Number</label>
          <input
            type="number"
            id="phone_number"
            value={formData.phone_number}
            placeholder="Enter your mobile number"
            required
            onChange={handleInputChange}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            placeholder="Password must be at least 8 characters, include one uppercase letter and one special character"
            required
            onChange={handleInputChange}
          />

          <label htmlFor="repassword">Re-enter password</label>
          <input
            type="password"
            id="repassword"
            value={formData.repassword}
            placeholder="Re-enter your password"
            required
            onChange={handleInputChange}
          />


          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            value={formData.age}
            placeholder="Enter your age"
            required
            onChange={handleInputChange}
          />


          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </select>
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            value={formData.city}
            placeholder="Which city are you in"
            required
            onChange={handleInputChange}
          />

          <button type="submit" className="signup-button">
            Sign up
          </button>
          {message && <div className="message">{message}</div>}

          <p className="agreement-text">
            By creating an account, you agree to Amazon's{" "}
            <a href="#">Conditions of Use</a> and{" "}
            <a href="#">Privacy Notice</a>.
          </p>
        </form>

        <p className="signin-prompt">
          Already have an account?{" "}
          <a href="/SignIn" className="signin-link">
            Sign in
          </a>
        </p>
        <p className="signin-prompt">
          Forget Password?{" "}
          <a href="/ForgetPassword" className="signin-link">
            Click here
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

export default SignUp;
