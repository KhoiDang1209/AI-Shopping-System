import React, { useState, useEffect } from 'react';
import './Cart.css';
import { useSelector, useDispatch } from 'react-redux';
import { RemoveFromCart, RemoveAllFromCart, UpdateCartQuantity } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from '../../Components/Navbar/Navigation';
import Footer from '../../Components/Footer/Footer';
import { GB_CURRENCY } from '../../Utils/constants';
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import ItemRatings from '../ItemPage/ItemRatings';
import { AddToCart } from '../../Redux/Action/Action';
const Cart = () => {
  const location = useLocation();
  const userData = location.state?.userData;
  const navigate = useNavigate(); // Hook to handle navigation
  const [userInfo, setUserInfo] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    age: userData?.age || '',
    gender: userData?.gender || '',
    city: userData?.city || '',
  });
  const [CartItem, SetCartItem] = useState([]);
  const Dispatch = useDispatch();
  const HandleAddToCart = async (item) => {
    Dispatch(AddToCart(item));
    try {
      console.log(item.product_id || item.id, userInfo.email)
      const response = await axios.post("http://localhost:8000/addToCart", { product_id: (item.product_id || item.id), user_email: userInfo.email, quantity: 1 });

      if (response.status === 200) {
        toast.success('Added to cart successfully', {
          position: 'bottom-right',
        });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error(error);
    }
  };
  // Fetch cart items when the component mounts
  useEffect(() => {
    fetchCartItems();
    if (CartItem.length > 0) {
      fetchRecommendedItems();
    }
  }, [CartItem]);

  const totalCost = CartItem.reduce((total, item) => {
    // Fallback values in case the properties are missing
    const quantity = item.quantity || 1; // Default to 1 if quantity is missing
    const price = item.discount_price_usd || item.price || 0; // Default to 0 if price is missing

    return total + (quantity * price);
  }, 0);

  const fetchCartItems = async () => {
    try {
      const response = await axios.post("http://localhost:8000/cart", { type: "display", user_email: userInfo.email });
      const fetchedCart = response.data.cart;
      SetCartItem(fetchedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart items.");
    }
  };

  const [recommendedItems, setRecommendedItems] = useState([]);

  const fetchRecommendedItems = async () => {
    try {
      const response = await axios.post("http://localhost:8000/cartRelatedItems", {
        user_email: userInfo.email,
        type: "display"
      });

      if (response.data.products && Array.isArray(response.data.products)) {
        setRecommendedItems(response.data.products);
      } else {
        setRecommendedItems([]);
      }
    } catch (error) {
      console.error("Error fetching related items:", error);
      // Not showing a toast error here because recommended items are not critical
      setRecommendedItems([]);
    }
  };

  console.log(CartItem)
  // Handle remove item from the cart
  const HandleRemoveFromCart = async (id) => {
    try {
      console.log("Removing product with ID:", id); // Add logging
      const response = await axios.post("http://localhost:8000/cart", {
        type: "remove",
        user_email: userInfo.email,
        product_id: id
      });
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
      await axios.post("http://localhost:8000/cart", { type: "remove-all", user_email: userInfo.email });
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
      await axios.post("http://localhost:8000/cart", {
        type: "update-quantity",
        user_email: userInfo.email,
        product_id: id,
        quantity: newQuantity
      });

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
      <NavBar userInfo={userInfo} />
      <div className="Cart">

        <div className="TopLeftCart">
          <div className="TopLeftCartTitle">Shopping Cart</div>
          <div className="DeselectAllCart" onClick={handleDeselectAll}>Deselect all items</div>
          <div className="CartPriceTextDivider">Price</div>
          <div className="CartItemDiv">
            {CartItem.map((item, ind) => (
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
                      onClick={() => HandleRemoveFromCart(item.product_id)}
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
          <div>
            Subtotal ({CartItem.length} items):
            <span className="SubTotalTitleSpan">
              {GB_CURRENCY.format(totalCost)} {/* Use the totalCost variable */}
            </span>
          </div>
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

      <div className='ItemImageProductPage2'>
        {recommendedItems.map((item, ind) => (
          <div className='ItemImageProductPageOne' key={item.product_id}>
            <div className='ImageBlockItemImageProductPageOne'>
              <img src={item.product_image} className="ProductImageProduct" alt={item.product_name} />
            </div>
            <div className='ProductNameProduct'>
              <Link
                to={{
                  pathname: `/Item/${item.product_id}`,
                }}
                state={{ userData }} // Pass userData in the state prop
                className="product__name__link"
              >
                {item.product_name}
              </Link>
              <div className='PriceProductDetailPage'>
                <div className='RateHomeDetail'>
                  <div className='RateHomeDetailPrice'>
                    {GB_CURRENCY.format(item.discount_price_usd)}
                  </div>
                  <div className='AddToCartButton' onClick={() => HandleAddToCart(item)}>
                    Add To Cart
                  </div>
                </div>
              </div>
              <div className='ProductRatings'>
                <ItemRatings avgRating={item.average_rating} ratings={item.no_of_ratings} />
              </div>
              <div className='SaleProductPage'>
                Up to 25% off on Black Friday
              </div>
              <div className='DeliveryHomepage'>
                Free Domestic Shipping By Amazon
              </div>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
