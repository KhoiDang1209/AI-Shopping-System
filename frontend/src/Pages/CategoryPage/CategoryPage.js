import React, { useEffect, useState } from 'react';
import './CategoryPage.css';
import StarRateIcon from '@mui/icons-material/StarRate';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NavBar from "../../Components/Navbar/Navigation";
import ProductFooter from "./CategoryPageFooter";
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AddToCart } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GB_CURRENCY } from '../../Utils/constants';
import ItemRatings from '../ItemPage/ItemRatings';
import { useParams, useLocation } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const CategoryPage = () => {
    const { category } = useParams();
    const location = useLocation();
    const userData = location.state?.userData;
    const Dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [listOfProductByCategory, setlistOfProductByCategory] = useState([]);
    const [productsPerPage] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRating, setSelectedRating] = useState(0);// 0 means no filter, 1 means 1 star & up, etc.
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
    //User can only add to cart when log in avoid unknow cart
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
                    category,
                    itemToAdd: item,
                }
            });
            return;
        }

        // console.log(item);
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

    // Fetching product data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const productsResponse = await axios.get("http://127.0.0.1:8000/getProductbyCategory/", {
                    params: { categoryencode: category },
                });
                if (productsResponse.status === 200) {
                    setlistOfProductByCategory(productsResponse.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [category]);

    // Calculate the range of products to display based on current page
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = listOfProductByCategory
        .filter(item => selectedRating === 0 || item.average_rating >= selectedRating)  // Apply rating filter
        .slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(listOfProductByCategory.length / productsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className='ProductPage'>
            <NavBar userInfo={userInfo} />
            <div className='ProductTopBanner'>
                {/* Banner content */}
                <div className='ProductTopBannerItems'>Electronics</div>
                <div className="ProductTopBannerItemsSubMenu">Mobiles & Accessories</div>
                <div className="ProductTopBannerItemsSubMenu">Laptops & Accessories</div>
                <div className="ProductTopBannerItemsSubMenu">TV & Home Entertainment</div>
                <div className="ProductTopBannerItemsSubMenu">Audio</div>
                <div className="ProductTopBannerItemsSubMenu">Cameras</div>
                <div className="ProductTopBannerItemsSubMenu">Computer Peripherals</div>
                <div className="ProductTopBannerItemsSubMenu">Smart Technology</div>
                <div className="ProductTopBannerItemsSubMenu">Musical Instruments</div>
                <div className="ProductTopBannerItemsSubMenu">Office & Stationary</div>
            </div>

            <div className='ProductPageMain'>
                {/* left sidebar */}
                <div className="ProductPageMainLeftCategory">
                    <div className='ProductPageMainLeftCategoryTitle'>Category</div>
                    <div className="ProductPageMainLeftCategoryContent">
                        <div className="ProductPageMainLeftCategoryTitleContent">
                            {currentProducts?.[0]?.main_category || "Default Category"}
                        </div>
                        <div className="ProductPageMainLeftCategoryContentSub">Macbooks</div>
                        <div className="ProductPageMainLeftCategoryContentSub">Amazon Prime</div>
                        <div className="ProductPageMainLeftCategoryContentSub">Average Customer Review</div>

                        {/* Rating Filters */}
                        <div className="RatingLeftBox" onClick={() => setSelectedRating(4)}>
                            <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <div className="AndUp"> & Up</div>
                        </div>

                        <div className="RatingLeftBox" onClick={() => setSelectedRating(3)}>
                            <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <div className="AndUp"> & Up</div>
                        </div>
                        <div className="RatingLeftBox" onClick={() => setSelectedRating(2)}>
                            <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <div className="AndUp"> & Up</div>
                        </div>
                        <div className="RatingLeftBox" onClick={() => setSelectedRating(1)}>
                            <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
                            <div className="AndUp"> & Up</div>
                        </div>
                    </div>
                </div>

                {/* right sidebar */}
                <div className='ProductPageMainRight'>
                    <div className="ProductPageMainRightTopBanner">
                        <span className='ProductPageMainRightTopBannerSpan'>
                            {`${indexOfFirstProduct + 1}-${Math.min(indexOfLastProduct, listOfProductByCategory.length)} of ${listOfProductByCategory.length} results`}
                        </span>
                    </div>

                    <div className='ItemImageProductPage'>
                        {currentProducts.map((item) => (
                            <div className='ItemImageProductPageOne' key={item.product_id}>
                                <div className='ImageBlockItemImageProductPageOne'>
                                    <img src={item.product_image} className="ProductImageProduct" alt={item.product_name} />
                                </div>
                                <div className='ProductNameProduct'>
                                    <Link to={`/Item/${item.product_id}`} className="product__name__link">
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

                    {/* Pagination Controls */}
                    <div className="pagination">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        {/* Page Number Buttons */}
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index + 1)}
                                className={currentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <ToastContainer />
            <ProductFooter />
        </div>
    );
};

export default CategoryPage;
