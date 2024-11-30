import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const YourAddressPage = () => {
    const location = useLocation();
    const userData = location.state?.userData;  // Get the user data passed via navigation
    console.log(userData); // Log to see if userData is passed correctly

    const [userAddressInfo, setUserAddressInfo] = useState({
        email: userData.email,
        unit_number: '',
        street_number: '',
        address_line1: '',
        address_line2: '',
        city: '',
        region: '',
        postal_code: '',
        country_id: '',
    });

    const [activeTab, setActiveTab] = useState('Your Address');
    const navigate = useNavigate();

    // Fetch user address data only if it's not already fetched
    const getUserAddressInfo = async () => {
        if (!userData) return; // Avoid running if userData is not available
        try {
            const response = await axios.post("http://127.0.0.1:8000/UserAddressInfor/", { email: userData.email });
            if (response.data.addresses && response.data.addresses.length > 0) {
                const address = response.data.addresses[0];  // Assuming the user has only one address
                setUserAddressInfo(address);
            }
        } catch (error) {
            console.error('Error fetching user address:', error);
        }
    };

    // Trigger fetching user address only when userData changes and if addresses haven't been set yet
    useEffect(() => {
        if (userData) {
            getUserAddressInfo();  // Call the function when userData is available
        }
    }, []);   // Ensure effect runs when either userData or userAddressInfo changes

    console.log(userAddressInfo); // Log to check if userAddressInfo is correctly updated

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        switch (tabName) {
            case 'Your Information':
                navigate('/your-information', { state: { userData: userData } });
                break;
            case 'Cart':
                navigate('/cart', { state: { userData: userData } });
                break;
            case 'Store':
                navigate('/store', { state: { userData: userData } });
                break;
            case 'Your Address':
                navigate('/your-address', { state: { userData: userData } });
                break;
            default:
                break;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            navigate('/UpdateAddress', { state: { userData: { ...userAddressInfo } } });
        } catch (error) {
            console.error('Error updating address:', error);
            alert('Failed to update address.');
        }
    };

    // If userData is not available, show loading state
    if (!userData) {
        return <div>Loading user data...</div>;
    }

    return (
        <div style={styles.container}>
            {/* Navigation Bar */}
            <div style={styles.navbar}>
                <div
                    style={activeTab === 'Your Information' ? styles.activeTab : styles.tab}
                    onClick={() => handleTabClick('Your Information')}
                >
                    Your Information
                </div>
                <div
                    style={activeTab === 'Cart' ? styles.activeTab : styles.tab}
                    onClick={() => handleTabClick('Cart')}
                >
                    Cart
                </div>
                <div
                    style={activeTab === 'Store' ? styles.activeTab : styles.tab}
                    onClick={() => handleTabClick('Store')}
                >
                    Store
                </div>
                <div
                    style={activeTab === 'Your Address' ? styles.activeTab : styles.tab}
                    onClick={() => handleTabClick('Your Address')}
                >
                    Your Address
                </div>
            </div>

            {/* Content Section */}
            <div style={styles.content}>
                {activeTab === 'Your Address' ? (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <h2>Your Address</h2>
                        <div style={styles.inputGroup}>
                            <label>Unit Number:</label>
                            <input
                                type="text"
                                value={userAddressInfo.unit_number}
                                readOnly
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Street Number:</label>
                            <input
                                type="text"
                                value={userAddressInfo.street_number}
                                readOnly
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Address Line 1:</label>
                            <input
                                type="text"
                                value={userAddressInfo.address_line1}
                                readOnly
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Address Line 2:</label>
                            <input
                                type="text"
                                value={userAddressInfo.address_line2}
                                readOnly
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>City:</label>
                            <input
                                type="text"
                                value={userAddressInfo.city}
                                readOnly
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Region:</label>
                            <input
                                type="text"
                                value={userAddressInfo.region}
                                readOnly
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Postal Code:</label>
                            <input
                                type="text"
                                value={userAddressInfo.postal_code}
                                readOnly
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Country:</label>
                            <input
                                type="text"
                                value={userAddressInfo.country_id}
                                readOnly
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.buttonRow}>
                            <button type="submit" style={styles.button}>Update Address</button>
                        </div>
                    </form>
                ) : (
                    <div style={styles.blankPage}>This page is currently empty.</div>
                )}
            </div>
        </div>
    );
};

// Styles for the component
const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
    },
    navbar: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f4f4f4',
        padding: '10px 0',
    },
    tab: {
        padding: '10px 20px',
        cursor: 'pointer',
        color: '#555',
    },
    activeTab: {
        padding: '10px 20px',
        cursor: 'pointer',
        color: 'white',
        backgroundColor: '#007bff',
    },
    content: {
        padding: '20px',
        textAlign: 'center',
    },
    form: {
        display: 'inline-block',
        textAlign: 'left',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    input: {
        width: '300px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    buttonRow: {
        textAlign: 'center',
    },
    button: {
        padding: '8px 12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    blankPage: {
        marginTop: '20px',
        color: '#999',
    },
};

export default YourAddressPage;


