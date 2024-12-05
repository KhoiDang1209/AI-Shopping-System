import React, { useState } from "react";
import "./SignIn.css";
import amazon_logo from "../../Assets/amazon_logo_black.png";
import { Link } from 'react-router-dom';

const SignIp = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
    setError({
      ...error,
      [id]: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    let newError = {
      email: "",
      password: "",
    };

    if (formData.email.trim() === "") {
      newError.email = "Please enter your email.";
      isValid = false;
    }
    if (formData.password.trim() === "") {
      newError.password = "Please enter your password.";
      isValid = false;
    } else if (formData.password.length < 6) {
      newError.password = "Password must be at least 6 characters long.";
      isValid = false;
    }

    setError(newError);

    if (isValid) {
      console.log("Form submitted", formData);
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

          <label htmlFor="email">Mobile number or email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            placeholder="Enter your email or mobile number"
            required
            onChange={handleInputChange}
          />
          {error.email && <p className="error-message">{error.email}</p>}

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            placeholder="At least 6 characters"
            required
            onChange={handleInputChange}
          />
          {error.password && <p className="error-message">{error.password}</p>}

          <Link to="/">
            <button type="submit" className="signin-button">
              Continue
            </button>
          </Link>

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

export default SignIp;
