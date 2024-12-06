import React, { useRef, useState, useEffect } from "react";
import "./CategoryPage.css";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import NavBar from "../../Components/Navbar/Navigation";
import HomepageFooter from "../../Pages/HomePage/HomepageFooter";
import { useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
const CategoryPage = () => {
    const location = useLocation();
    const userData = location.state?.userData;
    const { category } = useParams();  // Get category from the URL

    const [productByCategory, setProductByCategory] = useState([]);
    const [loading, setLoading] = useState(true);  // Track loading state
    const [error, setError] = useState(null);  // Track any errors 
    const [userInfo, setUserInfo] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        age: userData?.age || '',
        gender: userData?.gender || '',
        city: userData?.city || '',
    });
    const [startSlider, setStartSlider] = useState(0);
    const imgItemRef = useRef(null);

    useEffect(() => {
        const fetchProductsByCategory = async () => {
            try {
                const response = await axios.post("http://127.0.0.1:8000/getProductbyCategory/", {
                    category_name: category,  // Pass the category to the API
                });
                console.log(response)
                // Handle the successful response
                if (response.status === 200) {
                    setProductByCategory(response.data);  // Update state with API response
                }
            } catch (err) {
                setError("Failed to fetch products.");
                console.error(err);
            } finally {
                setLoading(false);  // Set loading to false once data is fetched
            }
        };

        fetchProductsByCategory();
    }, [category]);  // Re-run the effect when category changes
    console.log(productByCategory)
    const slideRight = () => {
        const totalSlides = imgItemRef.current.children.length - 1; // Total number of images
        const endSlider = totalSlides * -100; // Max negative translateX value
        if (startSlider > endSlider) {
            setStartSlider(startSlider - 100);
        }
    };

    const slideLeft = () => {
        if (startSlider < 0) {
            setStartSlider(startSlider + 100);
        }
    };

    // Render loading state, error, or products
    if (loading) {
        return <div>Loading products...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="homepage">
            <NavBar userInfo={userInfo} />
            {/* trượt ảnh */}
            <div> {category} </div>
            <div className="image__container">
                <div
                    className="image__list"
                    ref={imgItemRef}
                    style={{
                        transform: `translateX(${startSlider}%)`,
                        transition: "transform 0.5s",
                    }}
                >
                    {/* Image Items */}
                    <div className="image__item">
                        <img
                            src="https://m.media-amazon.com/images/I/61K28C55p4L._SX3000_.jpg"
                            alt="pic01"
                        />
                    </div>
                    <div className="image__item">
                        <img
                            src="https://m.media-amazon.com/images/I/71u+Dtt6JTL._SX3000_.jpg"
                            alt="pic02"
                        />
                    </div>
                    <div className="image__item">
                        <img
                            src="https://m.media-amazon.com/images/I/71fgNuf3lIL._SX3000_.jpg"
                            alt="pic03"
                        />
                    </div>
                    <div className="image__item">
                        <img
                            src="https://m.media-amazon.com/images/I/818WR6jtOyL._SX3000_.jpg"
                            alt="pic04"
                        />
                    </div>
                    <div className="image__item">
                        <img
                            src="https://m.media-amazon.com/images/I/61lwJy4B8PL._SX3000_.jpg"
                            alt="pic05"
                        />
                    </div>
                    <div className="image__item">
                        <img
                            src="https://m.media-amazon.com/images/I/71zpBcCjKPL._SX3000_.jpg"
                            alt="pic06"
                        />
                    </div>
                    <div className="image__item">
                        <img
                            src="https://m.media-amazon.com/images/I/71MoHByjgeL._SX3000_.jpg"
                            alt="pic07"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="image__btn">
                    <button className="btn__slider" onClick={slideLeft}>
                        <ChevronLeftOutlinedIcon />
                    </button>
                    <button className="btn__slider" onClick={slideRight}>
                        <ChevronRightOutlinedIcon />
                    </button>
                </div>

            </div>

            {/* bắt đầu làm */}
            {/* các card */}
            <div className="item__box">
                {/* card 01 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Score Black Friday Week deals
                        <div className="item__box__card__image">

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_772_BFW_CM_DQC_AmazonBasics_3D_1x_v3._SY116_CB541717183_.jpg" alt="image01" />
                                <div className="item__box__card__block__text">
                                    Amazon Basics and more
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_768_BFW_CM_DQC_HomeImprovement_2D_1x_v3._SY116_CB541717183_.jpg" alt="image02" />
                                <div className="item__box__card__block__text">
                                    Home Improvement
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_770_BFW_CM_DQC_Phone_Accessories_3B_1x_v3._SY116_CB541717183_.jpg" alt="image03" />
                                <div className="item__box__card__block__text">
                                    Cell phones & accessories
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_769_BFW_CM_DQC_Furniture_3A_1x_v3._SY116_CB541717183_.jpg" alt="image04" />
                                <div className="item__box__card__block__text">
                                    Furniture
                                </div>
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore">
                            <Link to="/Product" className="seeMore">
                                See more
                            </Link>
                        </div>
                    </div>
                </div>

                {/* card 02 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Refresh your space
                        <div className="item__box__card__image">

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/launchpad/2023/Gateway/January/DesktopQuadCat_186x116_LP-HP_B08MYX5Q2W_01.23._SY116_CB619238939_.jpg" alt="image01" />
                                <div className="item__box__card__block__text">
                                    Dining
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/launchpad/2023/Gateway/January/DesktopQuadCat_186x116_home_B08RCCP3HV_01.23._SY116_CB619238939_.jpgg" alt="image02" />
                                <div className="item__box__card__block__text">
                                    Home
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/launchpad/2023/Gateway/January/DesktopQuadCat_186x116_kitchen_B0126LMDFK_01.23._SY116_CB619238939_.jpg" alt="image03" />
                                <div className="item__box__card__block__text">
                                    Kitchen
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/launchpad/2023/Gateway/January/DesktopQuadCat_186x116_health-beauty_B07662GN57_01.23._SY116_CB619238939_.jpg" alt="image04" />
                                <div className="item__box__card__block__text">
                                    Health and Beauty
                                </div>
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore--1row">
                            <Link to="/Product" className="seeMore--1row">
                                See more
                            </Link>
                        </div>
                    </div>
                </div>

                {/* card 03 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Toys under $25
                        <div className="item__box__card__image">

                            <div className="item__box__card__block__only">
                                <img className="item__box__card__block__image__only" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2023/EBF23/Fuji_Desktop_Single_image_EBF_1x_v3._SY304_CB573698005_.jpgg" alt="image01" />
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore__only">
                            <Link to="/Product" className="seeMore__only">
                                See more
                            </Link>
                        </div>
                    </div>
                </div>

                {/* card 04 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Shop Black Friday deals
                        <div className="item__box__card__image">

                            <div className="item__box__card__block__only">
                                <img className="item__box__card__block__image__only" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BlackFriday24/Fuji_Black_Friday_Dashboard_card_1X_EN._SY304_CB542042483_.jpg" alt="image01" />
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore__only">
                            <Link to="/Product" className="seeMore__only">
                                Shop Black Friday deals
                            </Link>
                        </div>
                    </div>
                </div>

                {/* card 05 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Must-see Black Friday Week deals
                        <div className="item__box__card__image">

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_761_BFW_CM_DQC_Home_1A_1x_v3._SY116_CB541717183_.jpg" alt="image01" />
                                <div className="item__box__card__block__text">
                                    Home
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_767_BFW_CM_DQC_Sports_Outdoors_2C_1x_v3._SY116_CB541717183_.jpg" alt="image02" />
                                <div className="item__box__card__block__text">
                                    Sports & Outdoors
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_764_BFW_CM_DQC_Beauty_1D_1x_v3._SY116_CB541717183_.jpg" alt="image03" />
                                <div className="item__box__card__block__text">
                                    Beauty
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_766_BFW_CM_DQC_Headphones_2B_1x_v3._SY116_CB541717183_.jpgg" alt="image04" />
                                <div className="item__box__card__block__text">
                                    Headphones
                                </div>
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore">
                            <Link to="/Product" className="seeMore">
                                Shop all deals
                            </Link>
                        </div>
                    </div>
                </div>

                {/* card 06 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Black Friday Week deals are here
                        <div className="item__box__card__image">

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_763_BFW_CM_DQC_ComputerVideoGames_1C_1x_v3._SY116_CB541717183_.jpg" alt="image01" />
                                <div className="item__box__card__block__text">
                                    Tech & gaming
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_771_BFW_CM_DQC_Deals_Toys_Games_3C_1x_v3._SY116_CB541717183_.jpg" alt="image02" />
                                <div className="item__box__card__block__text">
                                    Toys & games
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_765_BFW_CM_DQC_Kitchen_2A_1x_v3._SY116_CB541717183_.jpg" alt="image03" />
                                <div className="item__box__card__block__text">
                                    Kitchen
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/DiscoTec/2024/BFCM/GW/Quad_Cards/BFCM_2024_762_BFW_CM_DQC_Fashion_1B_1x_v3._SY116_CB541717183_.jpg" alt="image04" />
                                <div className="item__box__card__block__text">
                                    Fashion
                                </div>
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore">
                            <Link to="/Product" className="seeMore">
                                See more
                            </Link>
                        </div>
                    </div>
                </div>

                {/* card 07 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Get your game on
                        <div className="item__box__card__image">

                            <div className="item__box__card__block__only">
                                <img className="item__box__card__block__image__only" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Stores-Gaming/FinalGraphics/Fuji_Gaming_store_Dashboard_card_1x_EN._SY304_CB564799420_.jpg" alt="image01" />
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore__only">
                            <Link to="/Product" className="seeMore__only">
                                Shop gaming
                            </Link>
                        </div>
                    </div>
                </div>

                {/* card 08 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Easy updates for elevated spaces
                        <div className="item__box__card__image">

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/img18/home/2023/Q2/Homepage/2023Q2_GW_EE_LaundryLuxe_D_Quad_186x116._SY116_CB594237035_.jpg" alt="image01" />
                                <div className="item__box__card__block__text">
                                    Baskets & hampers
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/img18/home/2023/Q2/Homepage/2023Q2_GW_EE_Kitchen_D_Quad_186x116._SY116_CB594237035_.jpg" alt="image02" />
                                <div className="item__box__card__block__text">
                                    Hardwares
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/img18/home/2023/Q2/Homepage/2023Q2_GW_EE_AccentFurniture_D_Quad_186x116._SY116_CB594237035_.jpg" alt="image03" />
                                <div className="item__box__card__block__text">
                                    Accent furniture
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/img18/home/2023/Q2/Homepage/2023Q2_GW_EE_Hallway_D_Quad_186x116._SY116_CB594237035_.jpg" alt="image04" />
                                <div className="item__box__card__block__text">
                                    Wallpaper & paint
                                </div>
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore">
                            <Link to="/Product" className="seeMore">
                                See more
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* card trượt */}
            <div className="card__slider">
                <div className="card__slider--long">
                    <div className="card__slider__title">
                        Popular products in Wireless internationally
                    </div>
                    {/* khung bao bên ngoài khung trượt card */}
                    <div className="card__slider__box">
                        {/* tạo thanh kéo ngang */}
                        <div className="card__slider__scroll">
                            {/* khung cho card */}
                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71blOLk9A6L._AC_SY200_.jpg" alt="image01" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/612bzkKC0WL._AC_SY200_.jpg" alt="image02" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/81qhkS6lcUL._AC_SY200_.jpg" alt="image03" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/51T9lfJEUML._AC_SY200_.jpg" alt="image04" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/613cPuOz5OL._AC_SY200_.jpg" alt="image05" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71B+4V5YhnL._AC_SY200_.jpg" alt="image06" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71H6lbf27hL._AC_SY200_.jpg" alt="image07" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/51yaQQSq59L._AC_SY200_.jpg" alt="image08" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61QZKB8QIRL._AC_SY200_.jpg" alt="image09" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71R6ka8Os4L._AC_SY200_.jpg" alt="image10" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/615H+ZA6E1L._AC_SY200_.jpg" alt="image11" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61nen6x72LL._AC_SY200_.jpg" alt="image12" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/612sUi2P8rL._AC_SY200_.jpg" alt="image13" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71JPv74eM-L._AC_SY200_.jpg" alt="image14" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/41rwpIz0sxL._AC_SY200_.jpg" alt="image15" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/4161BoDqu3L._AC_SY200_.jpg" alt="image16" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/51IxhAeE2fL._AC_SY200_.jpg" alt="image17" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61VwfUI+-eL._AC_SY200_.jpg" alt="image18" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61mGfE74wxL._AC_SY200_.jpg" alt="image19" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/51L2WuVkQfL._AC_SY200_.jpg" alt="image20" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/81xZ069pe1L._AC_SY200_.jpg" alt="image21" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/610Jl4dUB7L._AC_SY200_.jpg" alt="image22" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61m+fKy7wzL._AC_SY200_.jpg" alt="image23" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/81q2MtIt4CL._AC_SY200_.jpg" alt="image24" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61zW8yc4hTL._AC_SY200_.jpg" alt="image25" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61V2k6wY5tL._AC_SY200_.jpg" alt="image26" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71MnyXxedIL._AC_SY200_.jpg" alt="image27" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71RzaVCib3L._AC_SY200_.jpg" alt="image28" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61yNuISrZ3L._AC_SY200_.jpg" alt="image29" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/518Qh+G3I5L._AC_SY200_.jpg" alt="image30" className="card__slider__item__image" />
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* card trượt */}
            <div className="card__slider--01">
                <div className="card__slider--long">
                    <div className="card__slider__title">
                        Here come Holiday Specials
                    </div>
                    {/* khung bao bên ngoài khung trượt card */}
                    <div className="card__slider__box">
                        {/* tạo thanh kéo ngang */}
                        <div className="card__slider__scroll">
                            {/* khung cho card */}
                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Holiday_deals_1X_EN._CB541659723_.jpg" alt="image01" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Most_loved_deals_1X_EN._CB541659723_.jpg" alt="image02" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Deals_under_50_1X_EN._CB541659723_.jpg" alt="image03" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Deals_on_Computer_1X_EN._CB541659723_.jpg" alt="image04" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Deals_on_Fashion_1X_EN._CB541659723_.jpg" alt="image05" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Deals_on_Toys__Games_1X_EN._CB541659723_.jpg" alt="image06" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Gift_guides_1X_EN._CB541659723_.jpg" alt="image07" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Holiday_Fashion__1X_EN._CB541659723_.jpg" alt="image08" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Holiday_Home_Decor_1X_EN._CB541659723_.jpg" alt="image09" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Electronics_Gift_Guide_1X_EN._CB541659723_.jpg" alt="image10" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/Holiday_Shovler/Fuji_HolidayGG_Shoveler_Holiday_Toys_List_1X_EN._CB541659723_.jpg" alt="image11" className="card__slider__item__image" />
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* các card */}
            <div className="item__box--01">
                {/* card 01 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Most-loved travel essentials
                        <div className="item__box__card__image">

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/Backpack_1x._SY116_CB566100767_.jpg" alt="image01" />
                                <div className="item__box__card__block__text">
                                    Backpacks
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/TravelBag_1x._SY116_CB566100767_.jpg" alt="image02" />
                                <div className="item__box__card__block__text">
                                    Suitcases
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/Accessories_1x._SY116_CB566100767_.jpg" alt="image03" />
                                <div className="item__box__card__block__text">
                                    Accessories
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/Handbags_1x._SY116_CB566100767_.jpg" alt="image04" />
                                <div className="item__box__card__block__text">
                                    Handbags
                                </div>
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore--1row">
                            <Link to="/Product" className="seeMore--1row">
                                See more
                            </Link>
                        </div>
                    </div>
                </div>

                {/* card 02 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Fantastic Finds for Home
                        <div className="item__box__card__image">

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Kitchen._SY116_CB558654384_.jpg" alt="image01" />
                                <div className="item__box__card__block__text">
                                    Kitchen
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Home_decor._SY116_CB558654384_.jpg" alt="image02" />
                                <div className="item__box__card__block__text">
                                    Home Decor
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Dining._SY116_CB558654384_.jpg" alt="image03" />
                                <div className="item__box__card__block__text">
                                    Dining
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/DskBTFQuadCards/Fuji_BTF_Quad_Cards_1x_Smart_home._SY116_CB558654384_.jpg" alt="image04" />
                                <div className="item__box__card__block__text">
                                    Smart Home
                                </div>
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore--1row">
                            <Link to="/Product" className="seeMore--1row">
                                See more
                            </Link>
                        </div>
                    </div>
                </div>

                {/* card 03 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Gaming merchandise
                        <div className="item__box__card__image">

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/June/Fuji_Quad_Apparel_1x._SY116_CB667159060_.jpg" alt="image01" />
                                <div className="item__box__card__block__text">
                                    Apprarel
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/June/Fuji_Quad_Hat_1x._SY116_CB667159060_.jpg" alt="image02" />
                                <div className="item__box__card__block__text">
                                    Hats
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/June/Fuji_Quad_Figure_1x._SY116_CB667159060_.jpg" alt="image03" />
                                <div className="item__box__card__block__text">
                                    Action figures
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/June/Fuji_Quad_Mug_1x._SY116_CB667159063_.jpg" alt="image04" />
                                <div className="item__box__card__block__text">
                                    Mugs
                                </div>
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore--1row">
                            <Link to="/Product" className="seeMore--1row">
                                See more
                            </Link>
                        </div>
                    </div>
                </div>

                {/* card 04 */}
                <div className="item__box__card">
                    <div className="item__box__card__title">
                        Most-loved watches
                        <div className="item__box__card__image">

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/WomenWatches_1x._SY116_CB564394432_.jpg" alt="image01" />
                                <div className="item__box__card__block__text">
                                    Women
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/MenWatches_1x._SY116_CB564394432_.jpg" alt="image02" />
                                <div className="item__box__card__block__text">
                                    Men
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/GirlWatches_1x._SY116_CB564394432_.jpgg" alt="image03" />
                                <div className="item__box__card__block__text">
                                    Girls
                                </div>
                            </div>

                            <div className="item__box__card__block">
                                <img className="item__box__card__block__image" src="https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Events/2024/BAU2024Aug/BoyWatches_1x._SY116_CB564394432_.jpg" alt="image04" />
                                <div className="item__box__card__block__text">
                                    Boys
                                </div>
                            </div>
                        </div>

                        <div className="item__box__card__block__seeMore--1row">
                            <Link to="/Product" className="seeMore--1row">
                                See more
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

            {/* card trượt */}
            <div className="card__slider--02">
                <div className="card__slider--long">
                    <div className="card__slider__title">
                        Here come Holiday Specials
                    </div>
                    {/* khung bao bên ngoài khung trượt card */}
                    <div className="card__slider__box">
                        {/* tạo thanh kéo ngang */}
                        <div className="card__slider__scroll">
                            {/* khung cho card */}
                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/814ODyP8cgL._AC_SY200_.jpg" alt="image01" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61KedtnoewL._AC_SY200_.jpg" alt="image02" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71yCr1TDfJL._AC_SY200_.jpg" alt="image03" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71-KO+-WQoL._AC_SY200_.jpg" alt="image04" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61mrBMnPhfL._AC_SY200_.jpg" alt="image05" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/61pZC9GjRWL._AC_SY200_.jpg" alt="image06" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71qBcrVc+lL._AC_SY200_.jpg" alt="image07" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71YJXiyG3LL._AC_SY200_.jpg" alt="image08" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/71aDjWyuTtL._AC_SY200_.jpg" alt="image09" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/510Cvj313yL._AC_SY200_.jpg" alt="image10" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/91NMUNjp7OL._AC_SY200_.jpg" alt="image11" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/81HqnkGPgEL._AC_SY200_.jpg" alt="image12" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/91IGKPcEn2L._AC_SY200_.jpg" alt="image13" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/617ommgrJfL._AC_SY200_.jpg" alt="image14" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/91poO8oibLL._AC_SY200_.jpg" alt="image15" className="card__slider__item__image" />
                            </div>

                            <div className="card__slider__item">
                                <img src="https://m.media-amazon.com/images/I/51ZmkZrGVwL._AC_SY200_.jpg" alt="image16" className="card__slider__item__image" />
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <HomepageFooter />
        </div>
    );
};

export default CategoryPage;