import React, { useRef, useState, useEffect } from "react";
import "./HomePage.css";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import NavBar from "../../Components/Navbar/Navigation";
import HomepageFooter from "../../Pages/HomePage/HomepageFooter";
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";

const HomePage = () => {

  const location = useLocation();
  const userData = location.state?.userData;
  const [randomCategoriesWithProducts, setRandomCategoriesWithProducts] = useState([]); // Holds 5 random categories with products
  const [listOfAllMainCategory, setListOfAllMainCategory] = useState([]);
  const [originalProducts, setOriginalProducts] = useState({}); // Store the original products by category
  const [loading, setLoading] = useState(true);
  const [startSlider, setStartSlider] = useState(0);
  const imgItemRef = useRef(null);

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
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const categoriesResponse = await axios.get("http://127.0.0.1:8000/getAllCategory/");
        if (categoriesResponse.status === 200) {
          setListOfAllMainCategory(categoriesResponse.data.categories);
        }

        // Fetch products
        const productsResponse = await axios.get("http://127.0.0.1:8000/getAllProduct/");
        if (productsResponse.status === 200) {
          setOriginalProducts(productsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Runs only on mount

  // Process categories and products
  useEffect(() => {
    // Ensure both listOfAllMainCategory and originalProducts are available
    if (listOfAllMainCategory.length === 0 || Object.keys(originalProducts).length === 0) return;

    const updateRandomCategories = () => {
      // Select 5 random categories
      const selectedCategory = listOfAllMainCategory
        .sort(() => 0.5 - Math.random()) // Shuffle categories randomly
        .slice(0, 5); // Pick only 5 categories

      // Ensure that each selected category has up to 100 products and slice to 20 for display
      const categoriesWithProducts = selectedCategory.map((category) => {
        const products = originalProducts[category] || [];

        // Limit the category to 100 products (if available), then slice to show 20 products at a time
        const productsToDisplay = products.length >= 100 ? products.slice(0, 100) : products;

        return {
          category,
          products: productsToDisplay.slice(0, 20) // Only display 20 products at a time
        };
      });

      // Set the state with the updated categories and products
      setRandomCategoriesWithProducts(categoriesWithProducts);
    };

    // Initialize categories on first render
    updateRandomCategories();

    // Set an interval to update the categories every 10 seconds
    const interval = setInterval(updateRandomCategories, 10000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);

  }, [listOfAllMainCategory, originalProducts]); // Dependencies to re-run the effect when data changes


  

  return (
    <div className="homepage">
      <NavBar userInfo={userInfo} />
      {/* trượt ảnh */}
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

      <div className="item__box__container">
        <div className="item__box">
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

        </div>

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

      </div>

      {(!userData || (Object.keys(userData).length === 0 && userData.constructor === Object)) && (
        <div className="card__slider">
          {randomCategoriesWithProducts && randomCategoriesWithProducts.length > 0 ? (
            <div className="card__slider--long">
              <div className="card__slider__title">
                {randomCategoriesWithProducts[0].category}
              </div>
              <div className="card__slider__box">
                <div className="card__slider__scroll">
                  {randomCategoriesWithProducts[0].products
                    .slice(0, 20)
                    .map((product) => (
                      <div
                        key={product.product_id || product.product_name}
                        className="card__slider__item1"
                      >
                        <Link
                          to={product.product_link}
                          className="card__slider__item__link"
                        >
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="card__slider__item__image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=Image+Unavailable"; // Fallback image
                            }}
                          />
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-indicator">Loading...</div> // Loading indicator
          )}
        </div>
      )}

      {(!userData || (Object.keys(userData).length === 0 && userData.constructor === Object)) && (
        <div className="card__slider">
          {randomCategoriesWithProducts && randomCategoriesWithProducts.length > 0 ? (
            <div className="card__slider--long">
              <div className="card__slider__title">
                {randomCategoriesWithProducts[1].category}
              </div>
              <div className="card__slider__box">
                <div className="card__slider__scroll">
                  {randomCategoriesWithProducts[1].products
                    .slice(0, 20)
                    .map((product) => (
                      <div
                        key={product.product_id || product.product_name}
                        className="card__slider__item1"
                      >
                        <Link
                          to={product.product_link}
                          className="card__slider__item__link"
                        >
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="card__slider__item__image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=Image+Unavailable"; // Fallback image
                            }}
                          />
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-indicator">Loading...</div> // Loading indicator
          )}
        </div>
      )}
      {(!userData || (Object.keys(userData).length === 0 && userData.constructor === Object)) && (
        <div className="card__slider">
          {randomCategoriesWithProducts && randomCategoriesWithProducts.length > 0 ? (
            <div className="card__slider--long">
              <div className="card__slider__title">
                {randomCategoriesWithProducts[2].category}
              </div>
              <div className="card__slider__box">
                <div className="card__slider__scroll">
                  {randomCategoriesWithProducts[2].products
                    .slice(0, 20)
                    .map((product) => (
                      <div
                        key={product.product_id || product.product_name}
                        className="card__slider__item1"
                      >
                        <Link
                          to={product.product_link}
                          className="card__slider__item__link"
                        >
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="card__slider__item__image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=Image+Unavailable"; // Fallback image
                            }}
                          />
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-indicator">Loading...</div> // Loading indicator
          )}
        </div>
      )}
      {(!userData || (Object.keys(userData).length === 0 && userData.constructor === Object)) && (
        <div className="card__slider">
          {randomCategoriesWithProducts && randomCategoriesWithProducts.length > 0 ? (
            <div className="card__slider--long">
              <div className="card__slider__title">
                {randomCategoriesWithProducts[3].category}
              </div>
              <div className="card__slider__box">
                <div className="card__slider__scroll">
                  {randomCategoriesWithProducts[3].products
                    .slice(0, 20)
                    .map((product) => (
                      <div
                        key={product.product_id || product.product_name}
                        className="card__slider__item1"
                      >
                        <Link
                          to={product.product_link}
                          className="card__slider__item__link"
                        >
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="card__slider__item__image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=Image+Unavailable"; // Fallback image
                            }}
                          />
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-indicator">Loading...</div> // Loading indicator
          )}
        </div>
      )}
      {(!userData || (Object.keys(userData).length === 0 && userData.constructor === Object)) && (
        <div className="card__slider">
          {randomCategoriesWithProducts && randomCategoriesWithProducts.length > 0 ? (
            <div className="card__slider--long">
              <div className="card__slider__title">
                {randomCategoriesWithProducts[4].category}
              </div>
              <div className="card__slider__box">
                <div className="card__slider__scroll">
                  {randomCategoriesWithProducts[4].products
                    .slice(0, 20)
                    .map((product) => (
                      <div
                        key={product.product_id || product.product_name}
                        className="card__slider__item1"
                      >
                        <Link
                          to={product.product_link}
                          className="card__slider__item__link"
                        >
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="card__slider__item__image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=Image+Unavailable"; // Fallback image
                            }}
                          />
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-indicator">Loading...</div> // Loading indicator
          )}
        </div>
      )}

      <div className="item__box__container">
        <div className="item__box">
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

        </div>

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

      </div>

      {/* card 07 */}
      {/* <div className="item__box__card">
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
        </div> */}

      {/* card 08 */}
      {/* <div className="item__box__card">
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
      </div> */}

      {/* các card */}
      {/* <div className="item__box--01"> */}
      {/* card 01 */}
      {/* <div className="item__box__card">
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
        </div> */}

      {/* card 02 */}
      {/* <div className="item__box__card">
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
        </div> */}

      {/* card 03 */}
      {/* <div className="item__box__card">
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
        </div> */}

      {/* card 04 */}
      {/* <div className="item__box__card">
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

      </div> */}

      {/* card trượt */}
      {/* <div className="card__slider--02">
        <div className="card__slider--long">
          <div className="card__slider__title">
            Here come Holiday Specials
          </div> */}
      {/* khung bao bên ngoài khung trượt card */}
      {/* <div className="card__slider__box">
            {/* tạo thanh kéo ngang */}
      {/* <div className="card__slider__scroll"> */}
      {/* khung cho card */}
      {/*<div className="card__slider__item">
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
      </div> */}

      <HomepageFooter />
    </div>
  );
};

export default HomePage;