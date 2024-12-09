import React from 'react';
import NavBar from "../../Components/Navbar/Navigation";
import Footer from "../../Components/Footer/Footer";
import { useState, useEffect } from "react";
import { callAPI } from "../../Utils/CallAPI";
import "./Item.css";
import ItemDetail from './ItemDetail';
import { GB_CURRENCY } from '../../Utils/constants';
import { useSelector, useDispatch } from 'react-redux';
import { AddToCart } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import axios from "axios";
import ItemRatings from '../ItemPage/ItemRatings';

const Item = () => {
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
    console.log(userData)
    const Dispatch = useDispatch();
    const CartItems = useSelector((state) => state.cart.items);
    const HandleAddToCart = async (item) => {
        if (!userInfo || !userInfo.email) {
            // Pop up login request and navigate to login
            toast.info("Please log in to add items to the cart.", {
                position: "bottom-right"
            });

            // Navigate to the login page, passing the current page and the item to add as state
            navigate('/SignIn', {
                state: {
                    from: location.pathname,
                    itemToAdd: item,
                }
            });
            return;
        }

        console.log(item);
        // toast.success("Added Item To Cart", {
        //     position: "bottom-right"
        // });
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


    const { product_id } = useParams(); // Get the ID from the URL
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getProduct = async (product_id) => {
        fetch(`http://localhost:8000/Item/${product_id}`)
            .then((response) => {
                if (!response.ok) {
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

    return (product &&
        <div>
            <NavBar userInfo={userInfo} />
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

            <div className='ItemImageProductPage1'>
                {/* {currentProducts.map((item) => ( */}
                <div className='ItemImageProductPageOne' key={product.product_id}>
                    <div className='ImageBlockItemImageProductPageOne'>
                        <img src={product.product_image} className="ProductImageProduct" alt={product.product_name} />
                    </div>
                    <div className='ProductNameProduct'>
                        <Link
                            to={{
                                pathname: `/Item/${product.product_id}`,
                            }}
                            state={{ userData }} // Pass userData in the state prop
                            className="product__name__link"
                        >
                            {product.product_name}
                        </Link>
                        <div className='PriceProductDetailPage'>
                            <div className='RateHomeDetail'>
                                <div className='RateHomeDetailPrice'>
                                    {GB_CURRENCY.format(product.discount_price_usd)}
                                </div>
                                <div className='AddToCartButton' onClick={() => HandleAddToCart(product)}>
                                    Add To Cart
                                </div>
                            </div>
                        </div>
                        <div className='ProductRatings'>
                            <ItemRatings avgRating={product.average_rating} ratings={product.no_of_ratings} />
                        </div>
                        <div className='SaleProductPage'>
                            Up to 25% off on Black Friday
                        </div>
                        <div className='DeliveryHomepage'>
                            Free Domestic Shipping By Amazon
                        </div>
                    </div>
                </div>
                {/* ))} */}
                {/* {currentProducts.map((item) => ( */}
                <div className='ItemImageProductPageOne' key={product.product_id}>
                    <div className='ImageBlockItemImageProductPageOne'>
                        <img src={product.product_image} className="ProductImageProduct" alt={product.product_name} />
                    </div>
                    <div className='ProductNameProduct'>
                        <Link
                            to={{
                                pathname: `/Item/${product.product_id}`,
                            }}
                            state={{ userData }} // Pass userData in the state prop
                            className="product__name__link"
                        >
                            {product.product_name}
                        </Link>
                        <div className='PriceProductDetailPage'>
                            <div className='RateHomeDetail'>
                                <div className='RateHomeDetailPrice'>
                                    {GB_CURRENCY.format(product.discount_price_usd)}
                                </div>
                                <div className='AddToCartButton' onClick={() => HandleAddToCart(product)}>
                                    Add To Cart
                                </div>
                            </div>
                        </div>
                        <div className='ProductRatings'>
                            <ItemRatings avgRating={product.average_rating} ratings={product.no_of_ratings} />
                        </div>
                        <div className='SaleProductPage'>
                            Up to 25% off on Black Friday
                        </div>
                        <div className='DeliveryHomepage'>
                            Free Domestic Shipping By Amazon
                        </div>
                    </div>
                </div>
                {/* ))} */}
                {/* {currentProducts.map((item) => ( */}
                <div className='ItemImageProductPageOne' key={product.product_id}>
                    <div className='ImageBlockItemImageProductPageOne'>
                        <img src={product.product_image} className="ProductImageProduct" alt={product.product_name} />
                    </div>
                    <div className='ProductNameProduct'>
                        <Link
                            to={{
                                pathname: `/Item/${product.product_id}`,
                            }}
                            state={{ userData }} // Pass userData in the state prop
                            className="product__name__link"
                        >
                            {product.product_name}
                        </Link>
                        <div className='PriceProductDetailPage'>
                            <div className='RateHomeDetail'>
                                <div className='RateHomeDetailPrice'>
                                    {GB_CURRENCY.format(product.discount_price_usd)}
                                </div>
                                <div className='AddToCartButton' onClick={() => HandleAddToCart(product)}>
                                    Add To Cart
                                </div>
                            </div>
                        </div>
                        <div className='ProductRatings'>
                            <ItemRatings avgRating={product.average_rating} ratings={product.no_of_ratings} />
                        </div>
                        <div className='SaleProductPage'>
                            Up to 25% off on Black Friday
                        </div>
                        <div className='DeliveryHomepage'>
                            Free Domestic Shipping By Amazon
                        </div>
                    </div>
                </div>
                {/* ))} */}
            </div>
            <ToastContainer />
            <Footer />
        </div>
    );
};

export default Item;
