import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import "./FPVerify.css";

function FPVerify() {
    const location = useLocation();
    const { email } = location.state || {}; // Access the userData passed via navigate

    const [emailValidate, setEmailValidate] = useState({
        email: email || '',  // Set email from userData
        code: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Hook to handle navigation

    // Handle changes in input fields
    const handleChange = (e) => {
        setEmailValidate({
            ...emailValidate,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://127.0.0.1:8000/verify-email/", emailValidate);
            console.log('Validate successful:', response.data);
            setMessage("Email verified successfully!");

            // After email verification, navigate to ChangePassword and pass email state
            navigate('/ChangePassword', { state: { email: emailValidate.email } });
        } catch (error) {
            setMessage(error.response?.data?.detail || "Verification failed.");
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>Verify Email</h2>
                <p>A verification code has been sent to: {emailValidate.email}</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="code">Verification Code</label>
                    <input
                        type="text"
                        name="code"
                        id="code"
                        placeholder="Enter the verification code"
                        value={emailValidate.code}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="signup-button">Verify</button>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
}

export default FPVerify;
