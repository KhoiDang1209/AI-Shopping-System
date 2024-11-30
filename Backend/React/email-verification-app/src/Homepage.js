import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Homepage = () => {
    const location = useLocation();
    const userData = location.state?.userData;

    // Log the userData to debug
    console.log('Received userData:', userData);

    // Set the initial user info based on userData from state
    const [userInfo, setUserInfo] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
    });

    // Define state to track the active tab
    const [activeTab, setActiveTab] = useState('Your Information');
    const navigate = useNavigate();

    // Event handler to change the active tab and navigate
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        // Navigate to the corresponding tab page
        switch (tabName) {
            case 'Your Information':
                navigate('/your-information', { state: { userData: { ...userInfo } } });
                break;
            case 'Cart':
                navigate('/cart', { state: { userData: { ...userInfo } } });
                break;
            case 'Store':
                navigate('/store', { state: { userData: { ...userInfo } } });
                break;
            case 'Your Address':
                navigate('/your-address', { state: { userData: { ...userInfo } } });
                break;
            default:
                break;
        }
    };

    // Event handler for the Update button
    const handleUpdate = () => {
        navigate('/Update', { state: { userData: { ...userInfo } } });
    };

    // Event handler for the Delete button
    const handleDelete = () => {
        setUserInfo({
            name: '',
            email: '',
            phone: '',
            password: '',
            address: '',
        });
        alert('User information deleted!');
    };

    if (!userData) {
        return <div>Loading user data...</div>;  // Show a loading message if no data
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
                {activeTab === 'Your Information' ? (
                    <table style={styles.table}>
                        <tbody>
                            <tr>
                                <td>Name:</td>
                                <td>
                                    <input
                                        type="text"
                                        value={userInfo.name}
                                        readOnly
                                        style={styles.input}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Email:</td>
                                <td>
                                    <input
                                        type="email"
                                        value={userInfo.email}
                                        readOnly
                                        style={styles.input}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Phone:</td>
                                <td>
                                    <input
                                        type="tel"
                                        value={userInfo.phone}
                                        readOnly
                                        style={styles.input}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Address:</td>
                                <td>
                                    <input
                                        type="text"
                                        value={userInfo.address}
                                        readOnly
                                        style={styles.input}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2" style={styles.buttonRow}>
                                    <button onClick={handleUpdate} style={styles.button}>
                                        Update
                                    </button>
                                    <button onClick={handleDelete} style={styles.buttonDelete}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
    table: {
        margin: '0 auto',
        borderCollapse: 'collapse',
    },
    input: {
        width: '200px',
        padding: '5px',
        marginBottom: '10px',
        backgroundColor: '#f0f0f0', // Gray background to show the field is read-only
        border: '1px solid #ccc',
    },
    buttonRow: {
        textAlign: 'center',
    },
    button: {
        padding: '8px 12px',
        marginRight: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    buttonDelete: {
        padding: '8px 12px',
        backgroundColor: '#dc3545',
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

export default Homepage;
