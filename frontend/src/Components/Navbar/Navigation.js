import React, { useEffect, useRef, useState } from 'react';
import "./NavBar.css";
import amazon_logo from "../../Assets/amazon_logo.png";
import vietnam from '../../Assets/vietnam.png';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { Link, useNavigate, createSearchParams } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import {motion} from "framer-motion"
import LanguageIcon from '@mui/icons-material/Language';
import { useSelector, useDispatch } from 'react-redux';
import { callAPI } from '../../Utils/CallAPI';

const NavBar = () => {
    const [showAll, setShowAll] = useState(false);
    const allItems = [
        {_id:"100", title:"All Departments"},
        {_id:"101", title:"Arts & Crafts"},
        {_id:"102", title:"Automotive"},
        {_id:"103", title:"Baby"},
        {_id:"104", title:"Beauty & Personal Care"},
        {_id:"105", title:"Books"},
        {_id:"106", title:"Boys' Fashion"},
        {_id:"107", title:"Computers"},
        {_id:"108", title:"Deals"},
        {_id:"109", title:"Digital Musics"},
        {_id:"110", title:"Electronics"},
        {_id:"111", title:"Girls' Fashion"},
        {_id:"112", title:"Health & Households"},
        {_id:"113", title:"Home & Kitchen"},
        {_id:"114", title:"Industrial & Scientific"},
        {_id:"115", title:"Kindle Store"},
        {_id:"116", title:"Luggage"},
        {_id:"117", title:"Men's Fashion"},
        {_id:"118", title:"Movies & TVs"},
        {_id:"119", title:"Music, CDs & Vinyl"},
        {_id:"120", title:"Pet Supplies"},
        {_id:"121", title:"Prime Video"},
        {_id:"122", title:"Software"},
        {_id:"123", title:"Sports & Outdoors"},
        {_id:"124", title:"Tools & Home Improvements"},
        {_id:"125", title:"Toys & Games"},
        {_id:"126", title:"Video Games"},
        {_id:"127", title:"Women's Fashion"}
    ];


    const [sidebar, setSiderbar]= useState(false)

    const ref = useRef();
    useEffect(() => {
        document.body.addEventListener("click", (e) => {
            if (e.target.contains(ref.current)) {
                setSiderbar(false);
            }
        });
    }, [ref, sidebar]);

    const CartItems = useSelector((state) => state.cart.items);

    // khúc này làm suggestion cho search bar
    const [suggestions, setSuggestions] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const getSuggestions = () => {
        callAPI(`/Data/Product.json`)
            .then((suggestionResults) => {
                // Ensure to access the `Product` array inside the response
                setSuggestions(suggestionResults.Product || []);
            })
            .catch((error) => {
                console.error("Error fetching suggestions:", error);
            });
    };

    useEffect(() => {
        getSuggestions();
    }, []);

    const [category, setCategory] = useState("All");
    const navigate = useNavigate();

    const onHandleSubmit = (e) => {
        e.preventDefault();
        navigate({
            pathname: "/search",  // Ensure it's "/search" and not "search"
            search: `?${createSearchParams({ category, searchTerm })}`,  // Correctly append the query params
        });
        setSearchTerm("");
        setCategory("All");
    };
    
    // hết phần suggestion cho search bar

    return (
        <div className="navbar__component">
            {/* NavBar trên */}
            <div className="navbar__up">
                {/* bên trái */}
                <div className="navbar__up__left">
                    {/* logo */}
                    <Link to="/" className="navbar__logo">
                        <img className='amazon__logo' src={amazon_logo} alt='amazon_logo'/>
                    </Link>

                    {/* vị trí */}
                    <div className="navbar__location">
                        <div className="location__img">
                            <LocationOnOutlinedIcon className="location__icon" sx={{fontSize: "22px"}}/>
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
                    {/* ô tìm kiếm */}
                    <div className="navbar__searchbox">
                        {/* all */}
                        <div className="searchbox__box">
                            <div className="searchbox__all" onClick={() => setShowAll(!showAll)} onChange={(e) => setCategory(e.target.value)}>
                                <div className="searchbox__all__text">
                                    All
                                </div>
                                <ArrowDropDownOutlinedIcon sx={{ fontSize: "20px" }}/>
                            </div>

                            {showAll && (
                                <div>
                                    <ul className="searchbox__all__textbox">
                                        {allItems.map(item => (
                                            <li className="textbox__text" key={item._id}>{item.title}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <input type='text' className="searchbox__input" placeholder='Search Amazon' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>

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
                                                const title = Product.name.toLowerCase(); // Match with `name` field from JSON
                                                return (
                                                    title.startsWith(currentSearchTerm) && title !== currentSearchTerm
                                                );
                                            })
                                            .slice(0, 10)
                                            .map((Product) => (
                                                <div key={Product.id} onClick={() => setSearchTerm(Product.name)}>
                                                    {Product.name}
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
                        <img src={vietnam} className="vietnam__flag" alt="vietnam_logo"/>
                        <div className="vietnam__text">
                            EN <ArrowDropDownOutlinedIcon sx={{ fontSize: 16, marginLeft: -0.4 }} className="vietnam__dropdown"/>
                        </div>
                    </div>

                    {/* tài khoản */}
                    <Link to="/SignUp" className="account">
                        <div className="account__left">
                            <div className="account__up">
                                Hello, User
                            </div>
                            <div className="account__down">
                                Accounts & Lists
                            </div>
                        </div>
                        <div className="account__right">
                            <ArrowDropDownOutlinedIcon sx={{ fontSize: 16 }} className="account__dropdown"/>
                        </div>
                    </Link>

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
                    <Link to="/Cart" className="cart">
                        <span className="cart__up">
                            {CartItems.length}
                        </span>
                        <div className="cart__down">
                            <ShoppingCartOutlinedIcon className="cart__icon"/>
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
                    <div className="option" onClick={()=>setSiderbar(true)}>
                        <MenuOutlinedIcon sx={{ fontSize: "24px" }}/>
                        <div className="option__text">
                            All
                        </div>
                    </div>


                        <Link to={'/Product'}className="type">
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
                            <motion.div ref={ref} initial={{x:-500, opacity:0}} animate={{x:0, opacity:1}} transition={{duration:0.5}} className="sidebar__box">

                                {/* signin */}
                                <Link to="/User">
                                    <div className="sidebar__signin">
                                        <AccountCircleIcon/>
                                        <h3 className="sidebar__signin__text">
                                            Hello, User
                                        </h3>
                                    </div>
                                </Link>
                                
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
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Kindle E-readers & Books
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Amazon Appstore 
                                                <span>
                                                    <ArrowForwardIosIcon/>
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
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Computers
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Smart Home
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Arts & Crafts
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Automotive
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Baby
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Beauty and Personal Care
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Women's Fashion
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Men's Fashion
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Girls' Fashion
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Boys' Fashion
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Health and Household
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Home and Kitchen
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Industrial and Scientific
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Luggage
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Movies and Televisions
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Pet Supplies
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Software
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Sports and Outdoors
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Tools and Home Improvements
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Toys and Games
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Video Games
                                                <span>
                                                    <ArrowForwardIosIcon/>
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
                                            <Link to={'/Product'}className="sidebar__component__text">
                                                Gift Cards
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <li className="sidebar__component__text">
                                                Shop By Interest
                                            </li>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Amazon Live 
                                                <span>
                                                    <ArrowForwardIosIcon/>
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                International Shopping 
                                                <span>
                                                    <ArrowForwardIosIcon/>
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
                                                    <LanguageIcon/>
                                                </span>
                                                English
                                            </li>
                                            <li className="sidebar__component__text--modified">
                                                <span>
                                                    <img src={vietnam} className="vietnam__flag" alt="vietnam_logo"/>
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
                                <span className="sidebar__close__icon" onClick={()=>setSiderbar(false)}>
                                    <CloseIcon/>
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