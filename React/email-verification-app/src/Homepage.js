import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation to access passed state

const Homepage = () => {
    const location = useLocation(); // Use useLocation to retrieve the state
    const userData = location.state?.userData || {}; // Safely access userData from the navigate state

    // Define state to track the active tab
    const [activeTab, setActiveTab] = useState('Your Information');

    // Set the initial user info based on userData from state
    const [userInfo, setUserInfo] = useState({
        name: userData.user_name || '',
        email: userData.email_address || '',
        phone: userData.phone_number || '',
        password: userData.password || '',
        address: '',
    });

    // Event handler to change the active tab
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    // Event handler for the Update button (just logs the data for now)
    const handleUpdate = () => {
        console.log('Updated user information:', userInfo);
        alert('User information updated!');
    };

    // Event handler for the Delete button (resets the data for now)
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
                                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
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
                                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
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
                                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                                        style={styles.input}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Password:</td>
                                <td>
                                    <input
                                        type="password"
                                        value={userInfo.password}
                                        onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
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
                                        onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
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
