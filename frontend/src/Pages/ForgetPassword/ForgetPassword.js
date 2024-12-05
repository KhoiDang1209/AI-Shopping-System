import React, { useState } from "react";
import "./ForgetPassword.css";
import amazon_logo from "../../Assets/amazon_logo_black.png";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Send the email as an object
            const response = await axios.post('http://localhost:8000/forgetpassword', { email });
            console.log('Send email successful:', response.data);
            setMessage(`Verification code sent to ${email}`);
            console.log(email)
            // Navigate to the next page with email passed as state
            navigate('/FPverify', { state: { email } });

        } catch (error) {
            setMessage('Error sending verification code. Please try again.');
            console.error(error);
        }
    };

    return (
        <div className="signup-container">
            <Link to="/">
                <img src={amazon_logo} alt="Amazon Logo" className="signup-logo" />
            </Link>
            <div className="signup-box">
                <h1>ForgetPassword</h1>
                <form onSubmit={handleSubmit}>

                    <label htmlFor="email_address">Email</label>
                    <input
                        type="email"
                        id="email_address"  // Correct, this matches the 'email_address' key in formData
                        value={email}
                        placeholder="Enter your email "
                        required
                        onChange={handleEmailChange}
                    />

                    <button type="submit" className="signup-button">
                        Send Verify Email
                    </button>
                    {message && <div className="message">{message}</div>}

                </form>

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

export default ForgetPassword;
