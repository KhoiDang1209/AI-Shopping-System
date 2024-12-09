import React, { useState } from "react";
import "./ChangePassword.css";
import amazon_logo from "../../Assets/amazon_logo_black.png";
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import axios from 'axios';

const ChangePassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || {}; // Fetch email from location state
    const [ChangePasswordInfor, setPasswords] = useState({
        email: email || '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Handle changes in input fields
    const handleChange = (e) => {
        setPasswords({
            ...ChangePasswordInfor,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!passwordRegex.test(ChangePasswordInfor.newPassword) || !passwordRegex.test(ChangePasswordInfor.confirmPassword)) {
            setMessage("Password must be at least 8 characters, include one uppercase letter and one special character.");
            return;
        }
        setMessage('')
        // Check if passwords match
        if (ChangePasswordInfor.newPassword !== ChangePasswordInfor.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setError(''); // Clear error if passwords match

        try {
            const response = await axios.post("http://localhost:8000/postForgetPassword", ChangePasswordInfor);
            console.log('Password changed successfully:', response.data);

            setMessage("Password changed successfully! Redirecting to login...");

            // Redirect to login page after a delay
            setTimeout(() => {
                navigate("/"); // Navigating back to login page
            }, 2000); // Delay for 2 seconds to show the success message
        } catch (error) {
            setError(error.response?.data?.detail || "Error changing password. Please try again.");
        }
    };

    return (
        <div className="signup-container">
            <Link to="/">
                <img src={amazon_logo} alt="Amazon Logo" className="signup-logo" />
            </Link>
            <div className="signup-box">
                <h1>Change Password</h1>
                <form onSubmit={handleSubmit}>
                    {/* New Password Input */}
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={ChangePasswordInfor.newPassword}
                        placeholder="Enter your new password"
                        required
                        onChange={handleChange}
                    />

                    {/* Confirm Password Input */}
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={ChangePasswordInfor.confirmPassword}
                        placeholder="Re-enter your new password"
                        required
                        onChange={handleChange}
                    />

                    {/* Display Error or Success Message */}
                    {error && <p className="message error">{error}</p>}
                    {message && <p className="message success">{message}</p>}

                    {/* Submit Button */}
                    <button type="submit" className="signup-button">
                        Confirm
                    </button>
                </form>

                {/* Sign In prompt if user already has an account */}
                <p className="signin-prompt">
                    Already have an account?{" "}
                    <a href="/SignIn" className="signin-link">
                        Sign in
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

export default ChangePassword;
