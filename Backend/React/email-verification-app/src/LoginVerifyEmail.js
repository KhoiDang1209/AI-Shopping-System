import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function LoginVerifyEmail() {
    const location = useLocation();
    const userData = location.state?.userData || {};  // Destructure email from location.state with fallback

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

    const [message, setMessage] = useState('');
    const navigate = useNavigate();  // Hook to handle navigation

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

            // After email verification, navigate to Homepage and pass user info
            navigate('/Homepage', { state: { userData: { ...userInfo } } });

        } catch (error) {
            setMessage(error.response?.data?.detail || "Verification failed.");
        }
    };

    return (
        <div>
            <h2>Verify Email</h2>
            <p>A verification code has been sent to: {userInfo.email}</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="code"  // Added name="code" for correct binding
                    placeholder="Verification Code"
                    value={userInfo.code}
                    onChange={handleChange}  // Handle input change
                    required
                />
                <button type="submit">Verify</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default LoginVerifyEmail;
