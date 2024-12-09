import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        user_name: '',
        email_address: '',
        phone_number: '',
        password: '',
        age: '',
        gender: '',
        city: ''
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Hook to handle navigation

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation for username
        if (!/^\w{3,50}$/.test(formData.user_name)) {
            setMessage("Invalid username.");
            return;
        }

        // Phone number validation
        if (!/^\d{10}$/.test(formData.phone_number)) {
            setMessage("Phone number must be 10 digits.");
            return;
        }

        // Password validation (at least 8 characters, one uppercase, one special character)
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setMessage("Password must be at least 8 characters, include one uppercase letter and one special character.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/register', formData);
            console.log('Registration successful:', response.data);

            // Set a success message
            setMessage('Registration successful!');

            // Redirect to the VerifyEmail page, passing the email as state
            navigate('/verify', { state: { userData: { ...formData } } });
        } catch (error) {
            console.error('Error registering user:', error.response?.data || error.message);
            setMessage('Error registering user. Please try again.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>
                    Name:
                    <input
                        type="text"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Email:
                    <input
                        type="email"
                        name="email_address"
                        value={formData.email_address}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Phone Number:
                    <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Age:
                    <input
                        type="text"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Gender:
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    >
                        <option value="">Choose Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </label>
                <label style={styles.label}>
                    City:
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <button type="submit" style={styles.button}>
                    Register
                </button>
                {message && <div style={styles.message}>{message}</div>}
                <div style={styles.buttonGroup}>
                    <button onClick={handleLogin} style={styles.button}>
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '50px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '300px',
    },
    label: {
        marginBottom: '10px',
    },
    input: {
        width: '100%',
        padding: '8px',
        marginBottom: '10px',
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
        marginBottom: '15px',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '15px',
        gap: '10px',
    },
    message: {
        marginTop: '10px',
        padding: '10px',
        color: 'red',
    },
};

export default RegisterForm;
