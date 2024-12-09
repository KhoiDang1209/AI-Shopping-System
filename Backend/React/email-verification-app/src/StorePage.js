import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Store = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userData = location.state?.userData;

    // State to hold categories, products, loading, and errors
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all categories and products when the component loads
    useEffect(() => {
        fetchAllCategories();
        fetchAllProducts();
    }, []);

    // Define state to track the active tab
    const [activeTab, setActiveTab] = useState('Store');

    // Event handler to change the active tab and navigate
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        navigate(`/${tabName.toLowerCase().replace(' ', '-')}`, { state: { userData: { ...userData } } });
    };

    // Fetch all categories from the backend
    const fetchAllCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post('http://localhost:8000/getAllCategory/');
            const categoriesData = response.data;
            setCategories([{ category_name: 'All Categories' }, ...categoriesData]);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all products from the backend
    const fetchAllProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post('http://localhost:8000/getAllProduct/');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch products by category from the backend
    const fetchProductsByCategory = async (categoryName) => {
        try {
            setLoading(true);
            setError(null);
            if (categoryName === 'All Categories') {
                fetchAllProducts();
            } else {
                console.log(categoryName)
                const response = await axios.post('http://localhost:8000/getProductbyCategory/', {
                    category_name: categoryName,
                });
                setProducts(response.data);
            }
        } catch (error) {
            console.error('Error fetching products by category:', error);
            setError('Failed to load products by category.');
        } finally {
            setLoading(false);
        }
    };

    // Handle category selection
    const handleCategoryChange = (event) => {
        const selectedCategoryName = event.target.value;
        setSelectedCategory(selectedCategoryName);
        fetchProductsByCategory(selectedCategoryName);
    };

    // Handle product click
    const handleProductClick = (productId) => {
        console.log('Product clicked:', productId);
        // Navigate to a product details page
        navigate(`/product/${productId}`);
    };

    return (
        <div style={styles.container}>
            {/* Navigation Bar */}
            <div style={styles.navbar}>
                {['Your Information', 'Cart', 'Store', 'Your Address'].map((tab) => (
                    <div
                        key={tab}
                        style={activeTab === tab ? styles.activeTab : styles.tab}
                        onClick={() => handleTabClick(tab)}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            {/* Category Dropdown */}
            <div style={styles.dropdownContainer}>
                <label htmlFor="category-select">Select Category:</label>
                <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    style={styles.dropdown}
                >
                    {categories.map((category, index) => (
                        <option key={index} value={category.category_name}>
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Loading or Error Message */}
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div style={styles.error}>{error}</div>
            ) : (
                <div style={styles.productGrid}>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.product_id} style={styles.productCard}>
                                <img
                                    src={product.product_image}
                                    alt={product.product_name}
                                    style={styles.productImage}
                                    onClick={() => handleProductClick(product.product_id)}
                                />
                                <div
                                    style={styles.productName}
                                    onClick={() => handleProductClick(product.product_id)}
                                >
                                    {product.product_name}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No products available</div>
                    )}
                </div>
            )}
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
        color: 'white',
        backgroundColor: '#007bff',
    },
    dropdownContainer: {
        padding: '10px',
        textAlign: 'center',
    },
    dropdown: {
        padding: '5px 10px',
    },
    productGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        padding: '20px',
    },
    productCard: {
        textAlign: 'center',
        cursor: 'pointer',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '10px',
    },
    productImage: {
        width: '150px',
        height: '150px',
        objectFit: 'cover',
        marginBottom: '10px',
    },
    productName: {
        fontSize: '16px',
        color: '#333',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        padding: '10px',
    },
};

export default Store;
