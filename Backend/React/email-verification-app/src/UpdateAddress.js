import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import necessary hooks
import axios from 'axios'; // Import Axios for making API requests

const UpdateAddress = () => {
    const location = useLocation();
    const userData = location.state?.userData || {};  // Fallback to empty object if no data
    const [formData, setFormData] = useState({
        email: userData.email || '',
        unit_number: userData.unit_number || '',
        street_number: userData.street_number || '',
        address_line1: userData.address_line1 || '',
        address_line2: userData.address_line2 || '',
        city: userData.city || '',
        region: userData.region || '',
        postal_code: userData.postal_code || '',
        country_id: userData.country_id || '',  // Make sure it's an integer when submitting
    });

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

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

        // Validate that required fields are filled
        if (
            !formData.unit_number ||
            !formData.street_number ||
            !formData.address_line1 ||
            !formData.city ||
            !formData.region ||
            !formData.postal_code ||
            !formData.country_id
        ) {
            setMessage('Please fill in all required fields.');
            return;
        }

        try {
            console.log(userData)
            // Ensure country_id is sent as an integer
            let updatedFormData = { ...formData, country_id: parseInt(formData.country_id, 10) };
            updatedFormData = { ...updatedFormData, email: userData.email };

            console.log('Submitting Form Data:', updatedFormData);

            const response = await axios.post('http://localhost:8000/updateAddress', updatedFormData);
            console.log('Address update successful:', response.data);
            setMessage('Address updated successfully!');
        } catch (error) {
            console.error('Error updating address:', error);
            const errorDetail = error.response?.data?.detail || 'Failed to update address. Please try again.';
            setMessage(errorDetail);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Update Your Address Information</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>
                    Unit Number:
                    <input
                        type="text"
                        name="unit_number"
                        value={formData.unit_number}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Street Number:
                    <input
                        type="text"
                        name="street_number"
                        value={formData.street_number}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Address Line 1:
                    <input
                        type="text"
                        name="address_line1"
                        value={formData.address_line1}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Address Line 2:
                    <input
                        type="text"
                        name="address_line2"
                        value={formData.address_line2}
                        onChange={handleChange}
                        style={styles.input}
                    />
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
                <label style={styles.label}>
                    Region:
                    <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Postal Code:
                    <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Country ID:
                    <input
                        type="number"
                        name="country_id"
                        value={formData.country_id}
                        onChange={handleChange}
                        required
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

export default UpdateAddress;
