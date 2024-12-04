import React, { useState, useEffect } from 'react';
import {Link} from "react-router-dom";
import NavBar from "../../Components/Navbar/Navigation";
import Footer from "../../Components/Footer/Footer";
import "./Checkout.css";
import { GB_CURRENCY } from '../../Utils/constants';
import { useSelector, useDispatch } from 'react-redux';
import { RemoveFromCart, ClearCart } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Checkout = () => {

    const [CartItem, SetCartItem] = useState([]);
    const Dispatch = useDispatch();
    const CartItems = useSelector((state) => state.cart.items);

    const totalCost = CartItems.reduce((total, item) => total + item.price, 0);

    useEffect(() => {
      SetCartItem(CartItems);
    }, [CartItems])

    const HandleProceed = () => {
        Dispatch(ClearCart()); // Clear all items from the cart
        toast.success("Order Completed!", {
            position: "bottom-right"
        });
    };

    return (
        <div className="checkout">
            <NavBar />
            <div className="checkout__container">
                {/* checkout title */}
                <div className="checkout__title">
                    Checkout ({CartItem.length} items)
                </div>

                {/* checkout information */}
                {/* <div className="checkout__section">
                    <div className="checkout__part">
                        <h3>User Information</h3>
                    </div>
                    <div className="checkout__information">
                        hello
                    </div>
                </div> */}

                {/* checkout shows items */}
                <div className="checkout__section">
                    {/* khung này để hiện mục (không biết đặt tên gì cho hợp) */}
                    <div className="checkout__part">
                        <h3>Review Items</h3>
                    </div>
                    <div className="checkout__showitems">
                    {
                        CartItems.map((item, ind) => {
                        return  (
                            <div className="checkout__showitems__block" key={ind}> 
                                <div className="checkout__showitems__leftblock"> 
                                    <div className="checkout__showitems__leftblock__image"> 
                                        <img 
                                            className="checkout__showitems__leftblockimg"
                                            src={item.imageUrl} />
                                    </div> 
                                    <div className="checkout__showitems__leftblock__details">
                                        <div className="checkout__showitems__leftblock__name">
                                            {item.name}
                                        </div>
                                    </div> 
                                </div>
                                
                                <div className="checkout__showitems__rightblock">
                                    <div className="checkout__showitems__rightblock__price">{GB_CURRENCY.format(item.price)}</div>
                                </div>
                            </div>
                            )
                        })
                    }
                    </div>
                </div>

                {/* checkout shows price total */}
                <div className="checkout__section">
                    {/* khung này để hiện mục (không biết đặt tên gì cho hợp) */}
                    <div className="checkout__part">
                        <h3>Total</h3>
                    </div> 
                    <div className="checkout__showprice">
                        <span className="checkout__showprice__subtotal">{GB_CURRENCY.format(totalCost)}</span>
                    </div>
                </div>

                {/* button for payment */}
                <div className="checkout__section">
                    <div className="checkout__payment">
                        <div className="checkout__button" onClick={HandleProceed}>
                            Proceed
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
            <Footer />
        </div>
    )
}

export default Checkout