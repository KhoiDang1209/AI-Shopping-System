import React, { useState, useEffect } from 'react'
import './Cart.css';
import { useSelector, useDispatch } from 'react-redux';
import { RemoveFromCart } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from '../../Components/Navbar/Navigation';
import Footer from '../../Components/Footer/Footer';
import { GB_CURRENCY } from '../../Utils/constants';
import {Link} from "react-router-dom";

const Cart = () => {

  const [CartItem, SetCartItem] = useState([]);
  const Dispatch = useDispatch();
  const CartItems = useSelector((state) => state.cart.items);

  // let a = 0;
  // let cost = CartItems.map((item) => { return a = a + item.price })

  const totalCost = CartItems.reduce((total, item) => total + item.price, 0);

  useEffect(() => {
    SetCartItem(CartItems);
  }, [CartItems])

  const HandleRemoveFromCart = (id) => {
    toast.error("Removed From Cart", {
      position: "bottom-right"
    })
    Dispatch(RemoveFromCart(id));
  }

  return (
    <div>
        <NavBar />
        <div className="Cart">

        <div className="TopLeftCart">
            <div className="TopLeftCartTitle">Shopping Cart</div>
            <div className="DeselectAllCart">Deselect all items</div>
            <div className="CartPriceTextDivider">Price</div>

            <div className="CartItemDiv">
            {
                CartItems.map((item, ind) => {
                return (
                    <div className="CartItemBlock" key={ind}> 
                    <div className="CartItemLeftBlock">
                        <div className="CartItemLeftBlockImage">
                        <img
                            className="CartItemLeftBlockImg"
                            src={item.imageUrl} />
                        </div>
                        <div className="CartItemLeftBlockDetails">
                        <div className="CartItemProductName">
                            {item.name}
                        </div>
                        <div className="InStockCart">In Stock</div>
                        <div className="FreeShipping">Free Shipping Available</div>
                        <div className="RemoveFromCart" onClick={() => (HandleRemoveFromCart(item.id))}>Remove from Cart</div>
                        </div>
                    </div>

                    <div className="CartItemRightBlock">
                        <div className="CartItemPrice">{GB_CURRENCY.format(item.price)}</div>
                    </div>
                    </div>
                )
                })
            }

            </div>
        </div>

        <div className="TopRightCart">
            <div className="SubTotalTitle">
            Subtotal ({CartItem.length} items): <span className="SubTotalTitleSpan">{GB_CURRENCY.format(totalCost)}</span></div>
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
        <ToastContainer/>
        </div>
        <Footer />
    </div>
  );
};

export default Cart;
