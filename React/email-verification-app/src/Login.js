import React, { useState } from 'react';
import axios from 'axios'; // Import Axios for making API requests
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const Login = () => {
    // State to manage form data
    const [formData, setFormData] = useState({
        user_name_or_email: '', // Can be either username or email
        password: '',
    });

    const [message, setMessage] = useState(''); // To display success or error messages
    const navigate = useNavigate();
    // Event handler to update form data when input changes
    const handleChange = (e) => {
        console.log('Field:', e.target.name, 'Value:', e.target.value);
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Event handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.user_name_or_email || !formData.password) {
            setMessage('Please enter both username/email and password.');
            return;
        }

        try {
            // Sending login request to the backend
            console.log(formData)
            const response = await axios.post('http://localhost:8000/postLogin', formData);

            console.log('Login successful:', response.data);
            setMessage('Login successful!'); // Display success message
            navigate('/Homepage', { state: { userData: { ...response.data.user } } });
            // Redirect or further actions after successful login
            // Example: navigate('/dashboard');
        } catch (error) {
            setMessage(
                error.response?.data?.detail || 'Login failed. Please check your credentials.'
            );
        }
    };

    return (
        <div style={styles.container}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>
                    Username or Email:
                    <input
                        type="text"
                        name="user_name_or_email"
                        value={formData.user_name_or_email}
                        onChange={handleChange}
                        required
                        placeholder="Enter username or email"
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
                        placeholder="Enter password"
                        style={styles.input}
                    />
                </label>
                <button type="submit" style={styles.button}>
                    Login
                </button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
};

// Styles for the component
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '300px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9',
    },
    label: {
        marginBottom: '15px',
        fontSize: '14px',
    },
    input: {
        padding: '8px',
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    button: {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    message: {
        marginTop: '10px',
        fontSize: '14px',
        color: '#dc3545', // Red color for error messages
    },
};

export default Login;
