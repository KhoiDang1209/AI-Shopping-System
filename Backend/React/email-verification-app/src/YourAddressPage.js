import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const YourAddressPage = () => {
    const location = useLocation();
    const userData = location.state?.userData;

    const [userAddressInfo, setUserAddressInfo] = useState({
        email: userData?.email || '',
        unit_number: '',
        street_number: '',
        address_line1: '',
        address_line2: '',
        region: '',
        postal_code: '',
    });

    const [activeTab, setActiveTab] = useState('Your Address');
    const navigate = useNavigate();

    useEffect(() => {
        const getUserAddressInfo = async () => {
            if (!userData) return;
            try {
                const response = await axios.post('http://127.0.0.1:8000/UserAddressInfor/', {
                    email: userData.email,
                });
                if (response.data.addresses && response.data.addresses.length > 0) {
                    console.log(response.data.addresses)
                    const address = response.data.addresses[0];
                    setUserAddressInfo(prevState => ({
                        ...prevState,
                        ...address,
                    }));
                }
            } catch (error) {
                console.error('Error fetching user address:', error);
            }
        };

        if (userData) {
            getUserAddressInfo();  // Call the function when userData is available
        }
    }, [userData]);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        navigate(`/${tabName.replace(' ', '-').toLowerCase()}`, { state: { userData } });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/UpdateAddress', { state: { userData: { ...userAddressInfo } } });
    };

    if (!userData) {
        return <div>Loading user data...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.navbar}>
                {['Your Information', 'Cart', 'Store', 'Your Address'].map(tabName => (
                    <div
                        key={tabName}
                        style={activeTab === tabName ? styles.activeTab : styles.tab}
                        onClick={() => handleTabClick(tabName)}
                    >
                        {tabName}
                    </div>
                ))}
            </div>

            <div style={styles.content}>
                {activeTab === 'Your Address' && (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <h2>Your Address</h2>
                        {['unit_number', 'street_number', 'address_line1', 'address_line2', 'region', 'postal_code'].map((field) => (
                            <div style={styles.inputGroup} key={field}>
                                <label>{field.replace('_', ' ').toUpperCase()}:</label>
                                <input
                                    type="text"
                                    value={userAddressInfo[field] || ''}
                                    readOnly
                                    style={styles.input}
                                />
                            </div>
                        ))}
                        <div style={styles.buttonRow}>
                            <button type="submit" style={styles.button}>Update Address</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { fontFamily: 'Arial, sans-serif' },
    navbar: { display: 'flex', justifyContent: 'center', backgroundColor: '#f4f4f4', padding: '10px 0' },
    tab: { padding: '10px 20px', cursor: 'pointer', color: '#555' },
    activeTab: { padding: '10px 20px', cursor: 'pointer', color: 'white', backgroundColor: '#007bff' },
    content: { padding: '20px', textAlign: 'center' },
    form: { display: 'inline-block', textAlign: 'left', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' },
    inputGroup: { marginBottom: '15px' },
    input: { width: '300px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
    buttonRow: { textAlign: 'center' },
    button: { padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default YourAddressPage;
