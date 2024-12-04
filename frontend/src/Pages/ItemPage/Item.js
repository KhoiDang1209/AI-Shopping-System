import React from 'react';
import NavBar from "../../Components/Navbar/Navigation";
import Footer from "../../Components/Footer/Footer";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import { callAPI } from "../../Utils/CallAPI";
import "./Item.css";
import ItemDetail from './ItemDetail';
import { GB_CURRENCY } from '../../Utils/constants';
import { useSelector, useDispatch } from 'react-redux';
import { AddToCart } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Item = () => {

    const Dispatch = useDispatch();
    const CartItems = useSelector((state) => state.cart.items);
    const HandleAddToCart = (item) => {
      toast.success("Added Item To Cart", {
        position: "bottom-right"
      })
      Dispatch(AddToCart(item));
    }

    const { id } = useParams(); // Get the ID from the URL
    const [product, setProduct] = useState(null);

    const getProduct = () => {
        callAPI(`/Data/Product.json`)
            .then((data) => {
                // Find the product by ID
                const foundProduct = data.Product.find((item) => item.id === id);
                setProduct(foundProduct || null); // Set product or null if not found
            })
            .catch((error) => console.error("Error fetching product:", error));
    };

    useEffect(() => {
        getProduct();
    }, [id]); 

    if (!product) {
        return <h1>Loading Product ...</h1>;
    }

    // Function to format the price (remove commas or periods and then format)
    // const formatPrice = (price) => {
    //     // Remove commas or periods from the string and convert to a number
    //     const priceNumber = parseFloat(price.replace(/,/g, '').replace(/\./g, ''));
    //     // Format the number with the desired currency format
    //     return GB_CURRENCY.format(priceNumber);
    // };

    return ( product &&
        <div>
            <NavBar />
            <div className="items__space">
                <div className="items__container">
                    <div className="items__box">
                        {/* left box */}
                        <div className="items__box__left">
                            <img src={`${product.imageUrl}`} className="item__box__left__image"/>
                        </div>
                        
                        {/* middle box */}
                        <div className="items__box__middle">
                            <div className="items__box__middle__up">
                                <ItemDetail product={product} ratings={true} />
                            </div>
                            <div className="items__box__middle__down">
                                {product.description}
                            </div>
                        </div>

                        {/* right box */}
                        <div className="items__box__right">
                            <div className="items__box__right__currency">
                                {GB_CURRENCY.format(product.price)}
                            </div>
                            <div className="items__box__right__text">
                                Free International Return
                            </div>
                            <div className="items__box__right__text">
                                Free delivery
                            </div>
                            <div className="items__box__right__stock">
                                In Stock
                            </div>
                            <button onClick={() => (HandleAddToCart(product))} className="items__box__right__button">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer/>
            <Footer />
        </div>
    );
};

export default Item;
