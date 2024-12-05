import React, { useState } from "react";
import "./Information.css";
import amazon_logo from "../../Assets/amazon_logo_black.png";
import { Link } from "react-router-dom";

const Information = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    repassword: "",
    age: "",
    gender: "",
    address: "",
  });

  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
    repassword: "",
    age: "",
    gender: "",
    address: "",
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

  const validateAge = (age) => {
    const ageNumber = parseInt(age, 10);
    return ageNumber >= 0 && ageNumber <= 99;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    let newError = {
      name: "",
      email: "",
      password: "",
      repassword: "",
      age: "",
      gender: "",
      address: "",
    };

    if (formData.name.trim() === "") {
      newError.name = "Please enter your name.";
      isValid = false;
    }
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
    if (formData.repassword.trim() === "") {
      newError.repassword = "Please re-enter your password.";
      isValid = false;
    } else if (formData.password !== formData.repassword) {
      newError.repassword = "Passwords do not match.";
      isValid = false;
    }
    if (formData.age.trim() === "" || !validateAge(formData.age)) {
      newError.age = "Please enter a valid age (0-99).";
      isValid = false;
    }
    if (formData.gender.trim() === "") {
      newError.gender = "Please select a gender.";
      isValid = false;
    }
    if (formData.address.trim() === "") {
      newError.address = "Please enter your address.";
      isValid = false;
    }

    setError(newError);

    if (isValid) {
      console.log("Form submitted", formData);
    }
  };

  return (
    <div className="information-container">
      <img src={amazon_logo} alt="Amazon Logo" className="information-logo" />
      <div className="information-box">
        <h1>Change User Information</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Your name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            placeholder="First and last name"
            required
            onChange={handleInputChange}
          />
          {error.name && <p className="error-message">{error.name}</p>}

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

          <label htmlFor="repassword">Re-enter password</label>
          <input
            type="password"
            id="repassword"
            value={formData.repassword}
            placeholder="Re-enter your password"
            required
            onChange={handleInputChange}
          />
          {error.repassword && <p className="error-message">{error.repassword}</p>}

          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            value={formData.age}
            placeholder="Enter your age"
            required
            onChange={handleInputChange}
          />
          {error.age && <p className="error-message">{error.age}</p>}

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
          {error.gender && <p className="error-message">{error.gender}</p>}

          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            value={formData.address}
            placeholder="Enter your address"
            required
            onChange={handleInputChange}
          />
          {error.address && <p className="error-message">{error.address}</p>}

          <Link to="/User">
            <button type="submit" className="information-button">
              Save Changes
            </button>
          </Link>

          <p className="agreement-text">
            By changing your account's information, you agree to Amazon's{" "}
            <a href="#">Conditions of Use</a> and{" "}
            <a href="#">Privacy Notice</a>.
          </p>
        </form>
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

export default Information;