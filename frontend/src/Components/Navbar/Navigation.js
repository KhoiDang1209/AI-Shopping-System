import React, { useEffect, useRef, useState } from 'react';
import "./NavBar.css";
import amazon_logo from "../../Assets/amazon_logo.png";
import vietnam from '../../Assets/vietnam.png';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { Link, useLocation, useNavigate, createSearchParams } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from "framer-motion"
import LanguageIcon from '@mui/icons-material/Language';
import { useSelector, useDispatch } from 'react-redux';
import { callAPI } from '../../Utils/CallAPI';

const NavBar = ({ userInfo }) => {
    const [category, setCategory] = useState("All");
    const [userData, setUserData] = useState({
        name: userInfo?.name || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        address: userInfo?.address || '',
        age: userInfo?.age || '',
        gender: userInfo?.gender || '',
        city: userInfo?.city || '',
    });

    const handleNavigate = () => {
        navigate('/', {
            state: { userData: { ...userInfo } },
        });
    };
    const [showAll, setShowAll] = useState(false);
    const allItems = [
        { main_category_encoded: 15, title: "stores" },
        { main_category_encoded: 4, title: "car & motorbike" },
        { main_category_encoded: 7, title: "home, kitchen, pets" },
        { main_category_encoded: 13, title: "pet supplies" },
        { main_category_encoded: 6, title: "home & kitchen" },
        { main_category_encoded: 11, title: "men's shoes" },
        { main_category_encoded: 0, title: "accessories" },
        { main_category_encoded: 3, title: "beauty & health" },
        { main_category_encoded: 16, title: "toys & baby products" },
        { main_category_encoded: 12, title: "music" },
        { main_category_encoded: 14, title: "sports & fitness" },
        { main_category_encoded: 17, title: "tv, audio & cameras" },
        { main_category_encoded: 19, title: "women's shoes" },
        { main_category_encoded: 1, title: "appliances" },
        { main_category_encoded: 5, title: "grocery & gourmet foods" },
        { main_category_encoded: 9, title: "kids' fashion" },
        { main_category_encoded: 2, title: "bags & luggage" },
        { main_category_encoded: 10, title: "men's clothing" },
        { main_category_encoded: 8, title: "industrial supplies" },
        { main_category_encoded: 18, title: "women's clothing" }
    ];

    const categoryMapping = {
        "stores": 15,
        "car & motorbike": 4,
        "home, kitchen, pets": 7,
        "pet supplies": 13,
        "home & kitchen": 6,
        "men's shoes": 11,
        "accessories": 0,
        "beauty & health": 3,
        "toys & baby products": 16,
        "music": 12,
        "sports & fitness": 14,
        "tv, audio & cameras": 17,
        "women's shoes": 19,
        "appliances": 1,
        "grocery & gourmet foods": 5,
        "kids' fashion": 9,
        "bags & luggage": 2,
        "men's clothing": 10,
        "industrial supplies": 8,
        "women's clothing": 18
    };

    const [sidebar, setSiderbar] = useState(false)

    const ref = useRef();
    useEffect(() => {
        document.body.addEventListener("click", (e) => {
            if (e.target.contains(ref.current)) {
                setSiderbar(false);
            }
        });
    }, [ref, sidebar]);

    const CartItems = useSelector((state) => state.cart.items);
    // When a category is selected
    const handleCategorySelect = (categoryTitle) => {
        const mainCategoryEncoded = categoryMapping[categoryTitle]; // Get main_category_encoded
        if (mainCategoryEncoded === undefined) {
            console.error("Category title not found in mapping:", categoryTitle);
            return; // Stop execution if the category title is invalid
        }
        console.log(userData)
        navigate(`/Homepage/${mainCategoryEncoded}`, { state: { userData: { ...userData } } }); // Navigate with the encoded value
        setShowAll(false); // Close the dropdown after selection
    };
    const handleProfileClick = () => {
        // Ensure userData is defined
        if (!userData) {
            console.error("No user data available!");
            return;
        }

        // Use navigate to go to /UserPage with state
        navigate('/UserPage', {
            state: { userData }  // Pass userData as state to /UserPage
        });
    };

    const handleLogOutClick = () => {
        // Clear user info and navigate to home page
        setUserData(null); // Optionally clear user-specific state
        navigate('/', { state: null }); // Pass null state to clear location.state
    };

    // khúc này làm suggestion cho search bar
    const [suggestions, setSuggestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const getSuggestions = async (query) => {
        fetch(`http://localhost:8000/products/search?query=${query}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch suggestions");
                }
                return response.json();
            })
            .then((data) => {
                setSuggestions(data.products || []); // Adjust for the API response format
            })
            .catch((error) => {
                console.error("Error fetching suggestions:", error);
            });
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim()) { // Only fetch if searchTerm is non-empty
                getSuggestions(searchTerm);
            } else {
                setSuggestions([]); // Clear suggestions for empty input
            }
        }, 300); // Add debounce to reduce API calls

        return () => clearTimeout(delayDebounceFn); // Cleanup debounce timer
    }, [searchTerm]);


    const navigate = useNavigate();

    const onHandleSubmit = (e) => {
        e.preventDefault();
        navigate({
            pathname: "/search",
            search: `?${createSearchParams({ category, searchTerm })}`, // Adds query params
        }, {
            state: { userData }, // Pass userData in the state object
        });
        setSearchTerm("");
        setCategory("All");
    };
    // State to control dropdown visibility
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Function to toggle the dropdown menu visibility
    const toggleDropdown = () => {
        setIsDropdownOpen(prevState => !prevState);
    };
    // hết phần suggestion cho search bar
    // console.log(userData)
    return (
        <div className="navbar__component">
            {/* NavBar trên */}
            <div className="navbar__up">
                {/* bên trái */}
                <div className="navbar__up__left">
                    {/* logo */}
                    <div>
                        {/* Option 1: Using navigate with button */}
                        <button onClick={handleNavigate} className="navbar__logo">
                            <img className="amazon__logo" src={amazon_logo} alt="amazon_logo" />
                        </button>
                    </div>

                    {/* vị trí */}
                    <div className="navbar__location">
                        <div className="location__img">
                            <LocationOnOutlinedIcon className="location__icon" sx={{ fontSize: "22px" }} />
                        </div>
                        <div className="navbar__location__place">
                            <div className="place__top">
                                Deliver to
                            </div>
                            <div className="place__bottom">
                                Vietnam
                            </div>
                        </div>
                    </div>
                </div>


                {/* ở giữa */}
                <div className="searchbox__middle">
                    {/* Search Box */}
                    <div className="navbar__searchbox">
                        {/* All Categories Dropdown */}
                        <div className="searchbox__box">
                            <div
                                className="searchbox__all"
                                onClick={() => setShowAll(!showAll)}
                            >
                                <div className="searchbox__all__text">All</div>
                                <ArrowDropDownOutlinedIcon sx={{ fontSize: "20px" }} />
                            </div>

                            {/* Dropdown list of categories */}
                            {showAll && (
                                <div>
                                    <ul className="searchbox__all__textbox">
                                        {allItems.map(item => (
                                            <li
                                                className="textbox__text"
                                                key={item._id}
                                                onClick={() => handleCategorySelect(item.title)}  // Handle category selection
                                            >
                                                {item.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}


                            {/* Search Input */}
                            <input
                                type="text"
                                className="searchbox__input"
                                placeholder="Search Amazon"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Search Icon */}
                            <div className="searchbox__icon" onClick={onHandleSubmit}>
                                <SearchOutlinedIcon sx={{ fontSize: "26px" }} />
                            </div>
                        </div>
                        {
                            suggestions && searchTerm && (
                                <div className="suggestion__box">
                                    {
                                        suggestions
                                            .filter((Product) => {
                                                const currentSearchTerm = searchTerm.toLowerCase();
                                                const title = Product.product_name.toLowerCase(); // Match with `name` field from JSON
                                                return title.includes(currentSearchTerm);
                                            })
                                            .slice(0, 10)
                                            .map((Product) => (
                                                <div key={Product.product_id} onClick={() => setSearchTerm(Product.product_name)}>
                                                    {Product.product_name}
                                                </div>
                                            ))
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* bên phải */}
                <div className="navbar__up__right">
                    {/* ngôn ngữ */}
                    <div className="vietnam__logo">
                        <img src={vietnam} className="vietnam__flag" alt="vietnam_logo" />
                        <div className="vietnam__text">
                            VN <ArrowDropDownOutlinedIcon sx={{ fontSize: 16, marginLeft: -0.4 }} className="vietnam__dropdown" />
                        </div>
                    </div>

                    {/* tài khoản */}
                    <div className="account">
                        <div className="account__left">
                            <div className="account__up">
                                {userData?.name ? `Hello, ${userData.name}` : "Hello, User"}
                            </div>
                            <div className="account__down">
                                Accounts & Lists
                            </div>
                        </div>
                        <div className="account__right" onClick={toggleDropdown}>
                            <ArrowDropDownOutlinedIcon sx={{ fontSize: 16 }} className="account__dropdown" />
                        </div>

                        {/* Conditional Dropdown Menu */}
                        <div
                            className={`account__dropdownMenu ${isDropdownOpen ? 'open' : ''}`}
                        >
                            {!userData?.name ? (
                                <>
                                    <Link to="/SignUp" className="account__dropdownOption">
                                        Sign Up
                                    </Link>
                                    <Link to="/SignIn" className="account__dropdownOption">
                                        Sign In
                                    </Link>
                                    <Link to="/ForgetPassword" className="account__dropdownOption">
                                        Forget Password
                                    </Link>
                                </>
                            ) : (
                                <div>
                                    <div onClick={handleProfileClick} className="account__dropdownOption">
                                        Your Profile
                                    </div>
                                    <div onClick={handleLogOutClick} className="account__dropdownOption">
                                        Log Out
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* hoàn trả */}
                    <div className="return">
                        <div className="return__up">
                            Returns
                        </div>
                        <div className="return__down">
                            & Orders
                        </div>
                    </div>

                    {/* giỏ hàng */}
                    <Link
                        to={{
                            pathname: "/Cart",
                        }}
                        state={{ userData }} // Pass userData via state
                        className="cart"
                    >
                        <span className="cart__up">
                            {CartItems.length}
                        </span>
                        <div className="cart__down">
                            <ShoppingCartOutlinedIcon className="cart__icon" />
                        </div>
                        <div className="cart__title">
                            Cart
                        </div>
                    </Link>
                </div>
            </div>

            {/* NavBar dưới */}
            <div className="navbar__down">
                <div className="navbar__down__left">
                    <div className="option" onClick={() => setSiderbar(true)}>
                        <MenuOutlinedIcon sx={{ fontSize: "24px" }} />
                        <div className="option__text">
                            All
                        </div>
                    </div>


                    <Link to={'/Product'} className="type">
                        <div className="type__text">
                            Today's Deals
                        </div>
                    </Link>

                    <div className="type">
                        <div className="type__text">
                            Customer Service
                        </div>
                    </div>

                    <div className="type">
                        <div className="type__text">
                            Registry
                        </div>
                    </div>

                    <div className="type">
                        <div className="type__text">
                            Gift Cards
                        </div>
                    </div>

                    <div className="type">
                        <div className="type__text">
                            Sell
                        </div>
                    </div>
                </div>
            </div>

            {/* navbar bên trái */}
            {
                sidebar && (
                    <div className="sidebar__screen">
                        <div className="sidebar__all">
                            <motion.div ref={ref} initial={{ x: -500, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="sidebar__box">

                                {/* signin */}
                                <div className="sidebar__signin">
                                    <AccountCircleIcon />
                                    <h3 className="sidebar__signin__text">
                                        Hello, User
                                    </h3>
                                </div>

                                <div className="sidebar__wrap">
                                    {/* block 1 */}
                                    <div className="sidebar__component">
                                        <h3 className="sidebar__heading">
                                            Digital Content & Devices
                                        </h3>
                                        <ul className="sidebar__component__box">
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Amazon Music
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Kindle E-readers & Books
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Amazon Appstore
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                        </ul>
                                    </div>

                                    {/* block 2 */}
                                    <div className="sidebar__component">
                                        <h3 className="sidebar__heading">
                                            Shop by Department
                                        </h3>
                                        <ul className="sidebar__component__box">
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Electronics
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Computers
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Smart Home
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Arts & Crafts
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Automotive
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Baby
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Beauty and Personal Care
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Women's Fashion
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Men's Fashion
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Girls' Fashion
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Boys' Fashion
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Health and Household
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Home and Kitchen
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Industrial and Scientific
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Luggage
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Movies and Televisions
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Pet Supplies
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Software
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Sports and Outdoors
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Tools and Home Improvements
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Toys and Games
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Video Games
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                        </ul>
                                    </div>

                                    {/* block 3 */}
                                    <div className="sidebar__component">
                                        <h3 className="sidebar__heading">
                                            Programs and Features
                                        </h3>
                                        <ul className="sidebar__component__box">
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Gift Cards
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <li className="sidebar__component__text">
                                                Shop By Interest
                                            </li>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Amazon Live
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                International Shopping
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <li className="sidebar__component__text">
                                                Amazon Second Chance
                                            </li>
                                        </ul>
                                    </div>

                                    {/* block 4 */}
                                    <div className="sidebar__component">
                                        <h3 className="sidebar__heading">
                                            Help and Settings
                                        </h3>
                                        <ul className="sidebar__component__box">
                                            <li className="sidebar__component__text">
                                                Your Account
                                            </li>
                                            <li className="sidebar__component__text--modified">
                                                <span>
                                                    <LanguageIcon />
                                                </span>
                                                English
                                            </li>
                                            <li className="sidebar__component__text--modified">
                                                <span>
                                                    <img src={vietnam} className="vietnam__flag" alt="vietnam_logo" />
                                                </span>
                                                Viet Nam
                                            </li>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Customer Services
                                            </Link>
                                        </ul>
                                    </div>
                                </div>

                                {/* nút đóng */}
                                <span className="sidebar__close__icon" onClick={() => setSiderbar(false)}>
                                    <CloseIcon />
                                </span>
                            </motion.div>
                        </div>
                    </div>
                )
            }

        </div>
    );
}

export default NavBar;