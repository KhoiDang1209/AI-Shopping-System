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

    const { product_id } = useParams(); // Get the ID from the URL
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const getProduct = async (product_id) => {
        fetch(`http://localhost:8000/Item/${product_id}`)
        .then((response) => {
            if(!response.ok) {
                throw new Error("Failed to fetch prodcut");
            }
            return response.json();
        })
        .then((data) => {
            setProduct(data[0])
        })
        .catch((error) => {
            console.error("Error fetching product:", error);
            setError(error.message);
        })
        .finally(() => {
            setLoading(false);
        })
    }

    useEffect(() => {
        getProduct(product_id);
    }, [product_id]);

    if (!product) {
        return <h1>Loading Item ...</h1>;
    }

    if (error) return <h1>{error}</h1>;

    return ( product &&
        <div>
            <NavBar />
            <div className="items__space">
                <div className="items__container">
                    <div className="items__box">
                        {/* left box */}
                        <div className="items__box__left">
                            <img 
                                src={product.product_image} 
                                alt={product.product_name} 
                                className="item__box__left__image"
                            />
                        </div>
                        
                        {/* middle box */}
                        <div className="items__box__middle">
                            <div className="items__box__middle__up">
                                <ItemDetail product={product} ratings={true} />
                            </div>
                            <div className="items__box__middle__down">
                                {product.product_name}
                            </div>
                        </div>

                        {/* right box */}
                        <div className="items__box__right">
                            <div className="items__box__right__currency">
                                {GB_CURRENCY.format(product.discount_price_usd)}
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
