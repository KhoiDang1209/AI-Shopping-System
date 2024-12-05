import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import "./LoginVerify.css";

function LoginVerify() {
    const location = useLocation();
    const userData = location.state?.userData; // Access the userData passed via navigate
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Hook to handle navigation

    // Set the initial user info based on userData from state
    const [userInfo, setUserInfo] = useState({
        name: userData.user_name || '',
        email: userData.email_address || '',
        phone: userData.phone_number || '',
        password: userData.password || '',
        address: '',
        code: '',
        age: userData.age,
        gender: userData.gender,
        city: userData.city
    });


    // Handle changes in input fields
    const handleChange = (e) => {
        setUserInfo({
            ...userInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://127.0.0.1:8000/verify-email/", {
                email: userInfo.email,
                code: userInfo.code,
            });

            console.log('Validate successful:', response.data);
            setMessage("Email verified successfully!");
            console.log(userInfo)
            // After email verification, navigate to Homepage and pass user info
            navigate('/', { state: { userData: { ...userInfo } } });

        } catch (error) {
            setMessage(error.response?.data?.detail || "Verification failed.");
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>Verify Email</h2>
                <p>A verification code has been sent to: {userInfo.email}</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="code">Verification Code</label>
                    <input
                        type="text"
                        name="code"
                        id="code"
                        placeholder="Enter the verification code"
                        value={userInfo.code}
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

export default LoginVerify;
