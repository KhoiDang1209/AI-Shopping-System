import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate


const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Handle input change
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
    const handleLogin = async (e) => {
        e.preventDefault();
        navigate('/');
    }
    return (
        <div style={styles.container}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Email Address:</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button}>
                    Get Validation Code
                </button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
            <div style={styles.buttonGroup}>
                <button onClick={handleLogin} style={styles.button}>
                    Login
                </button>
            </div>
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
        marginBottom: '15px', // Adds space between login and group buttons
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '15px', // Adds spacing from the "Login" button
        gap: '10px', // Adds space between "Register" and "Forget Password?" buttons
    },
    message: {
        marginTop: '10px',
        color: '#007bff',
    },
};

export default ForgetPassword;
