import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Homepage = () => {
    const location = useLocation();
    const userData = location.state?.userData;

    const [userInfo, setUserInfo] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
    });

    const [activeTab, setActiveTab] = useState('Your Information');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [interestingProducts, setInterestingProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();

    // Check if it's the user's first login (runs only once after component mounts)
    useEffect(() => {
        const initializePage = async () => {
            await checkFirstTimeLogin();
            await fetchInterestingProducts();
        };
        initializePage();
    }, []); // Empty array means it only runs once, like `componentDidMount`.

    // Fetch categories only if it's the first-time login
    const checkFirstTimeLogin = async () => {
        try {
            const response = await axios.post('http://localhost:8000/preHomepage/', {
                email: userInfo.email,
            });
            if (!response.data.data) {
                await fetchAllCategories();
                setShowPopup(true);
            }
        } catch (error) {
            console.error('Error checking first-time login:', error);
        }
    };

    // Fetch all categories from the backend
    const fetchAllCategories = async () => {
        try {
            const response = await axios.post('http://localhost:8000/getAllCategory/');
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Fetch interesting products for the user (runs only once or if email changes)
    const fetchInterestingProducts = async () => {
        try {
            const response = await axios.post('http://localhost:8000/getAllInterestingProductByUserEmail/', {
                email: userInfo.email,
            });
            setInterestingProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching interesting products:', error);
        }
    };

    // Handle category selection
    const handleCategoryChange = (categoryName) => {
        setSelectedCategories((prevCategories) =>
            prevCategories.includes(categoryName)
                ? prevCategories.filter((cat) => cat !== categoryName)
                : [...prevCategories, categoryName]
        );
    };

    // Save selected categories to the backend
    const handleSaveCategories = async () => {
        try {
            await axios.post('http://localhost:8000/insertInterestingProduct/', {
                category_name: selectedCategories, email: userData.email
            });
            setShowPopup(false);
            fetchInterestingProducts(); // Refresh the interesting products
        } catch (error) {
            console.error('Error saving categories:', error);
        }
    };

    // Skip and auto-assign popular categories
    const handleSkip = async () => {
        try {
            await axios.post('http://localhost:8000/insertInterestingProductWithMostChosenItem/', {
                email: userInfo.email,
            });
            setShowPopup(false);
            fetchInterestingProducts(); // Refresh the interesting products
        } catch (error) {
            console.error('Error auto-assigning categories:', error);
        }
    };

    // Event handler to change the active tab and navigate
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        navigate(`/${tabName.toLowerCase().replace(' ', '-')}`, { state: { userData: { ...userInfo } } });
    };

    // Event handler for search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Event handler for the Update button
    const handleUpdate = () => {
        navigate('/update', { state: { userData: { ...userInfo } } });
    };

    // Event handler for the Delete button
    const handleDelete = () => {
        setUserInfo({
            name: '',
            email: '',
            phone: '',
            address: '',
        });
        alert('User information deleted!');
    };

    // Event handler for the Search button
    const handleSearch = () => {
        alert(`Search for: ${searchQuery}`);
    };

    if (!userData) {
        return <div>Loading user data...</div>; // Show a loading message if no data
    }

    return (
        <div style={styles.container}>
            {/* Popup Panel */}
            {showPopup && (
                <div style={styles.popupOverlay}>
                    <div style={styles.popup}>
                        <h3>Select Your Interesting Categories</h3>
                        <ul style={styles.categoryList}>
                            {categories.map((category) => (
                                <li key={category.category_name}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={category.category_name}
                                            onChange={() => handleCategoryChange(category.category_name)}
                                        />
                                        {category.category_name}
                                    </label>
                                </li>
                            ))}
                        </ul>
                        <button onClick={handleSaveCategories} style={styles.button}>
                            Save
                        </button>
                        <button onClick={handleSkip} style={styles.buttonSkip}>
                            Skip
                        </button>
                    </div>
                </div>
            )}

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

            {/* Search Bar */}
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Enter name of product..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={styles.searchInput}
                />
                <button onClick={handleSearch} style={styles.searchButton}>
                    Search
                </button>
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

// Styles
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
    searchContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px',
    },
    searchInput: {
        width: '300px',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        marginRight: '10px',
    },
    searchButton: {
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    content: {
        marginTop: '20px',
        padding: '0 20px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    input: {
        width: '100%',
        padding: '8px',
        marginBottom: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    buttonRow: {
        textAlign: 'center',
    },
    button: {
        padding: '8px 16px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        margin: '0 10px',
        cursor: 'pointer',
    },
    buttonDelete: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    buttonSkip: {
        padding: '8px 16px',
        backgroundColor: '#ffc107',
        color: 'black',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    popupOverlay: {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        width: '400px',
        textAlign: 'center',
    },
    categoryList: {
        listStyleType: 'none',
        padding: '0',
    },
    blankPage: {
        textAlign: 'center',
        fontSize: '16px',
        color: '#777',
    },
};

export default Homepage;
