import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import necessary hooks
import axios from 'axios'; // Import Axios for making API requests

const Update = () => {
    // Get user data from navigate state
    const location = useLocation();
    const userData = location.state?.userData || {};  // Fallback to empty object if no data

    // Initialize the form with user data
    const [formData, setFormData] = useState({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();  // Hook to handle navigation

    // Event handler to update form fields
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Event handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation (you can extend this further)
        if (!formData.name || !formData.email || !formData.phone) {
            setMessage('Please fill in all fields.');
            return;
        }

        try {
            // Send the updated data to the backend API
            const response = await axios.post('http://localhost:8000/Update', formData);
            console.log('Send email successful:', response.data);
            setMessage('Email has been sent successfully!');

            // Optionally navigate to a different page after the update
            // navigate('/Homepage', { state: { userData: { ...formData } } });
            navigate('/UpdateVerifyEmail', { state: { userData: { ...formData } } });
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Failed to update information. Please try again.');
        }
    };

    return (
        <div style={styles.container}>
            <h2>Update Your Information</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Phone:
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Address:
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </label>
                <button type="submit" style={styles.button}>Submit</button>
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
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '20px',
    },
    message: {
        marginTop: '10px',
        fontSize: '14px',
        color: '#dc3545', // Red color for error messages
    },
};

export default Update;
