import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [quantity, setQuantity] = useState({});
    const navigate = useNavigate();

    // Fetch the cart items when the component mounts
    useEffect(() => {
        axios
            .get("/cart") // Replace with the correct endpoint to fetch cart items
            .then((response) => {
                const fetchedCart = response.data.cart;
                setCartItems(fetchedCart);
                calculateTotalPrice(fetchedCart);
                // Initialize quantity state based on cart items
                const initialQuantity = fetchedCart.reduce((acc, item) => {
                    acc[item.id] = item.quantity;
                    return acc;
                }, {});
                setQuantity(initialQuantity);
            })
            .catch((error) => console.error("Error fetching cart:", error));
    }, []);

    // Calculate the total price based on cart items and their quantities
    const calculateTotalPrice = (cart) => {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalPrice(total);
    };

    // Handle change in item quantity
    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity <= 0) return; // Don't allow 0 or negative quantities
        setQuantity((prevQuantity) => ({
            ...prevQuantity,
            [itemId]: newQuantity,
        }));
        // Update the cart with the new quantity
        axios
            .post("/cart/update", { itemId, newQuantity })
            .then(() => {
                // Recalculate total price after updating quantity
                calculateTotalPrice(cartItems);
            })
            .catch((error) => console.error("Error updating quantity:", error));
    };

    // Remove an item from the cart
    const removeFromCart = (itemId) => {
        axios
            .delete(`/cart/remove/${itemId}`)
            .then(() => {
                // Update state after removing item
                const updatedCart = cartItems.filter((item) => item.id !== itemId);
                setCartItems(updatedCart);
                calculateTotalPrice(updatedCart);
            })
            .catch((error) => console.error("Error removing item:", error));
    };

    // Handle checkout
    const handleCheckout = () => {
        navigate("/checkout"); // Redirect to the checkout page
    };

    return (
        <div style={styles.cartPage}>
            <h1 style={styles.header}>Your Cart</h1>

            {/* Cart Items List */}
            {cartItems.length === 0 ? (
                <p style={styles.emptyCartText}>Your cart is empty.</p>
            ) : (
                <div style={styles.cartItems}>
                    {cartItems.map((item) => (
                        <div key={item.id} style={styles.cartItem}>
                            <div style={styles.cartItemDetails}>
                                <img src={item.image} alt={item.name} style={styles.cartItemImage} />
                                <div style={styles.cartItemInfo}>
                                    <h3>{item.name}</h3>
                                    <p>Price: ${item.price}</p>
                                    <div style={styles.quantitySelector}>
                                        <label htmlFor={`quantity-${item.id}`}>Quantity:</label>
                                        <input
                                            type="number"
                                            id={`quantity-${item.id}`}
                                            value={quantity[item.id] || item.quantity}
                                            min="1"
                                            max={item.stock}
                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            style={styles.quantityInput}
                                        />
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} style={styles.removeButton}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Total Price */}
            <div style={styles.totalPrice}>
                <h3>Total Price: ${totalPrice.toFixed(2)}</h3>
            </div>

            {/* Checkout Button */}
            <button onClick={handleCheckout} style={styles.checkoutButton}>
                Proceed to Checkout
            </button>
        </div>
    );
}

const styles = {
    cartPage: {
        padding: '20px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    cartItems: {
        marginBottom: '20px',
    },
    cartItem: {
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #ddd',
        padding: '10px 0',
    },
    cartItemDetails: {
        display: 'flex',
        width: '100%',
    },
    cartItemImage: {
        width: '100px',
        height: '100px',
        objectFit: 'cover',
        marginRight: '20px',
    },
    cartItemInfo: {
        flex: 1,
    },
    quantitySelector: {
        marginTop: '10px',
    },
    quantityInput: {
        width: '60px',
        padding: '5px',
        marginLeft: '10px',
    },
    removeButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    totalPrice: {
        marginTop: '20px',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    checkoutButton: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        fontSize: '16px',
    },
};

export default Cart;
