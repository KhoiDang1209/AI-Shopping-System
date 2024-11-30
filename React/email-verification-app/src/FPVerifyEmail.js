import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function FPVerifyEmail() {
    const location = useLocation();
    const { email } = location.state || {};  // Destructure email from location.state with fallback

    const [emailValidate, setEmailValidate] = useState({
        email: email || '',  // Set email from state or empty if undefined
        code: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();  // Hook to handle navigation

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
        <div>
            <h2>Verify Email</h2>
            <p>A verification code has been sent to: {emailValidate.email}</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="code"  // Added name="code" for correct binding
                    placeholder="Verification Code"
                    value={emailValidate.code}
                    onChange={handleChange}  // Handle input change
                    required
                />
                <button type="submit">Verify</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default FPVerifyEmail;
