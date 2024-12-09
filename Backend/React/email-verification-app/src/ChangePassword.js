import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const ChangePassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || {}; // Retrieve email from state

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

        // Check if passwords match
        if (ChangePasswordInfor.newPassword !== ChangePasswordInfor.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setError(''); // Clear error if passwords match

        try {
            const response = await axios.post("http://localhost:8000/postForgetPassword", ChangePasswordInfor);
            console.log('Password changed successfully:', response.data);

            setMessage("Password changed successfully! Redirect to login");

            // Redirect to login page after a delay
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.detail || "Error changing password. Please try again.");
        }
    };

    return (
        <div style={styles.container}>
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>New Password:</label>
                <input
                    type="password"
                    name="newPassword"
                    value={ChangePasswordInfor.newPassword}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                <label style={styles.label}>Confirm Password:</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={ChangePasswordInfor.confirmPassword}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                {error && <p style={styles.error}>{error}</p>}
                {message && <p style={styles.success}>{message}</p>}

                <button type="submit" style={styles.button}>
                    Confirm
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        width: '300px',
        margin: '100px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '8px',
        fontWeight: 'bold',
    },
    input: {
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    button: {
        padding: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        marginBottom: '10px',
    },
    success: {
        color: 'green',
        marginBottom: '10px',
    }
};

export default ChangePassword;
