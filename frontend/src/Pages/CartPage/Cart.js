import React, { useState, useEffect } from 'react';
import './Cart.css';
import { useSelector, useDispatch } from 'react-redux';
import { RemoveFromCart, RemoveAllFromCart, UpdateCartQuantity } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from '../../Components/Navbar/Navigation';
import Footer from '../../Components/Footer/Footer';
import { GB_CURRENCY } from '../../Utils/constants';
import { Link } from "react-router-dom";
import axios from 'axios';

const Cart = () => {
  const [CartItem, SetCartItem] = useState([]);
  const Dispatch = useDispatch();
  const CartItems = useSelector((state) => state.cart.items);

  const totalCost = CartItems.reduce((total, item) => total + item.price, 0);

  // Fetch cart items when the component mounts
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axios.post("http://localhost:8000/cart", { type: "display" });
      const fetchedCart = response.data.cart;
      SetCartItem(fetchedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart items.");
    }
  };

  // Handle remove item from the cart
  const HandleRemoveFromCart = async (id) => {
    try {
      await axios.post("http://localhost:8000/cart", { type: "remove", product_id: id });
      toast.error("Removed From Cart", { position: "bottom-right" });
      Dispatch(RemoveFromCart(id)); // Update Redux state
      fetchCartItems(); // Re-fetch cart items after removal
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart.");
    }
  };

  // Handle Deselect All Items
  const handleDeselectAll = async () => {
    try {
      // Send request to remove all items from the cart
      await axios.post("http://localhost:8000/cart", { type: "remove-all" });
      toast.error("All items removed from cart", { position: "bottom-right" });
      Dispatch(RemoveAllFromCart()); // Clear the Redux cart
      SetCartItem([]); // Clear the local state for cart items
      fetchCartItems();
    } catch (error) {
      console.error("Error deselecting all items:", error);
      toast.error("Failed to remove all items from cart.");
    }
  };

  // Handle quantity change for an item
  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) {
      toast.warn("Quantity cannot be less than 1.");
      return;
    }

    try {
      // Send updated quantity to the backend
      await axios.post("http://localhost:8000/cart", { type: "update-quantity", product_id: id, quantity: newQuantity });

      // Update Redux state
      Dispatch(UpdateCartQuantity(id, newQuantity));

      // Update local state
      SetCartItem((prevItems) =>
        prevItems.map((item) =>
          (item.product_id === id ? { ...item, quantity: newQuantity } : item)
        )
      );

      toast.success("Quantity updated", { position: "bottom-right" });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity.");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="Cart">

        <div className="TopLeftCart">
          <div className="TopLeftCartTitle">Shopping Cart</div>
          <div className="DeselectAllCart" onClick={handleDeselectAll}>Deselect all items</div>
          <div className="CartPriceTextDivider">Price</div>
          <div className="CartItemDiv">
            {CartItems.map((item, ind) => (
              <div className="CartItemBlock" key={ind}>
                <div className="CartItemLeftBlock">
                  <div className="CartItemLeftBlockImage">
                    <img
                      className="CartItemLeftBlockImg"
                      src={item.imageUrl || item.product_image}
                      alt={item.name || item.product_name}
                    />
                  </div>
                  <div className="CartItemLeftBlockDetails">
                    <div className="CartItemProductName">{item.name || item.product_name}</div>
                    <div className="InStockCart">In Stock</div>
                    <div className="FreeShipping">Free Shipping Available</div>

                    {/* Quantity Management */}
                    <div className="CartQuantityControls">
                      <button
                        className="DecreaseButton"
                        onClick={() =>
                          handleQuantityChange(item.product_id || item.id, (item.quantity ?? 100) - 1)
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="QuantityInput"
                        value={item.quantity ?? 100}
                        onChange={(e) =>
                          handleQuantityChange(item.product_id || item.id, parseInt(e.target.value) || 1)
                        }
                      />
                      <button
                        className="IncreaseButton"
                        onClick={() =>
                          handleQuantityChange(item.product_id || item.id, (item.quantity ?? 100) + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <div
                      className="RemoveFromCart"
                      onClick={() => HandleRemoveFromCart(item.id)}
                    >
                      Remove from Cart
                    </div>
                  </div>
                </div>

                <div className="CartItemRightBlock">
                  <div className="CartItemPrice">{GB_CURRENCY.format(item.price || item.discount_price_usd)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="TopRightCart">
          <div className="SubTotalTitle">
            Subtotal ({CartItems.length} items): <span className="SubTotalTitleSpan">{GB_CURRENCY.format(totalCost)}</span></div>
          <div className="GiftAddTo">
            <input type="checkbox" />
            <div>This order contains a gift</div>
          </div>
          <Link to="/Checkout" className="ProceedToBuy">
            <div className="ProceedToBuy__text">
              Proceed to checkout
            </div>
          </Link>
        </div>
        <ToastContainer />
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
