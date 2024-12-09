import React, { useEffect, useState } from 'react';
import './Product.css';
import StarRateIcon from '@mui/icons-material/StarRate';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
// import ProductDetail from "../../../public/Data/Product.json";
import NavBar from "../../Components/Navbar/Navigation"
import ProductFooter from "./ProductFooter"
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AddToCart } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GB_CURRENCY } from '../../Utils/constants';
import ItemRatings from '../ItemPage/ItemRatings';
import axios from "axios";

const Product = () => {
  const Dispatch = useDispatch();
  const CartItems = useSelector((state) => state.cart.items);

  const HandleAddToCart = (item) => {
    toast.success("Added Item To Cart", {
      position: "bottom-right"
    })
    Dispatch(AddToCart(item));
  }

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the JSON file from the public folder
  //Test take product from here
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8000/products/search?query=");
        if (!response.ok) {
          throw new Error("Failed to fetch product data.");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Error fetching product data. Please try again later.", {
          position: "bottom-right",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, []);
    // Fetch products from the backend API
    // useEffect(() => {
    //   const fetchProducts = async () => {
    //     try {
    //       const response = await axios.post("http://localhost:3000/searchProducts/");
    //       setProducts(response.data);
    //     } catch (err) {
    //       setError("Failed to fetch products.");
    //       console.error(err);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };
    //   fetchProducts();
    // }, []);


      // Fetch product details by product_id (for individual product page)
  // const fetchProductDetails = async (productId) => {
  //   try {
  //     const response = await axios.get(`http://localhost:3000/product/${productId}`);
  //     return response.data;
  //   } catch (err) {
  //     console.error("Error fetching product details:", err);
  //     setError("Failed to fetch product details.");
  //   }
  // };

  // if (loading) {
  //   return <h1>Loading Products...</h1>;
  // }

  // if (error) {
  //   return <h1>{error}</h1>;
  // }

  // // Add product to cart and handle quantity update if product already in cart
  // const handleAddToCartWithQuantity = async (product) => {
  //   try {
  //     // Check if the product is already in the cart
  //     const existingCartItem = CartItems.find(item => item.product_id === product.product_id);

  //     if (existingCartItem) {
  //       // If the item exists in the cart, update the quantity
  //       const updatedItem = { ...existingCartItem, quantity: existingCartItem.quantity + 1 };
  //       Dispatch(AddToCart(updatedItem));  // Update Redux store
  //       toast.success("Updated quantity in cart!", {
  //         position: "bottom-right"
  //       });
  //     } else {
  //       // If the item is not in the cart, add it
  //       const newCartItem = {
  //         product_id: product.product_id,
  //         user_email: "user@example.com", // Replace with dynamic user email
  //         quantity: 1, // Add 1 initially, can be modified as needed
  //       };

  //       const response = await axios.post("http://localhost:3000/addToCart/", newCartItem);
  //       if (response.data.success) {
  //         Dispatch(AddToCart(product));  // Add to Redux store
  //         toast.success("Added item to cart!", {
  //           position: "bottom-right"
  //         });
  //       } else {
  //         toast.error("Failed to add item to cart.", {
  //           position: "bottom-right"
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     toast.error("Error while adding item to cart.", {
  //       position: "bottom-right"
  //     });
  //   }
  // };

  // if (products.length === 0) {
  //     return <h1>Loading Products...</h1>;
  // }

  if (products.length === 0) {

  if (isLoading) {
    return <h1>Loading Products...</h1>;
  }

  if (products.length === 0) {
    return <h1>No Products Found</h1>;
  }


  return (
    <div className='ProductPage'>
      <NavBar />
      <div className='ProductTopBanner'>

        <div className='ProductTopBannerItems'>
          Electronics
        </div>

        <div className='ProductTopBannerItemsSubMenu'>Mobiles & Accessories</div>
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
          <div className='ProductPageMainLeftCategoryTitle'>Catergory</div>
          <div className="ProductPageMainLeftCategoryContent">
            <div className="ProductPageMainLeftCategoryTitleContent">Computers & Accessories</div>
            <div className="ProductPageMainLeftCategoryContentSub">Macbooks</div>
            <div className="ProductPageMainLeftCategoryContentSub">Amazon Prime</div>
            <div className="ProductPageMainLeftCategoryContentSub">Average Customer Review</div>

            <div className="RatingLeftBox">
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <div className="AndUp"> & Up</div>
            </div>

            <div className="RatingLeftBox">
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <div className="AndUp"> & Up</div>
            </div>

            <div className="RatingLeftBox">
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <div className="AndUp"> & Up</div>
            </div>

            <div className="RatingLeftBox">
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
            1-10 of {products.length} results for {""}
            <span className='ProductPageMainRightTopBannerSpan'>
              Laptops
            </span>
          </div>

          <div className='ItemImageProductPage'>

            {
              products.map((item, index) => {
                return (
                  <div className='ItemImageProductPageOne' key={item.product_id}>
                    <div className='ImageBlockItemImageProductPageOne'>
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="ProductImageProduct" />
                    </div>

                    <div className='ProductNameProduct'>
                      {/* tên sản phẩm */}
                      <Link to={`/Item/${item.product_id}`} className="product__name__link">
                        {item.product_name}
                      </Link>
                      {/* <div className='ProductNameProductRating'>
                        <StarRateIcon sx={{ fontSize: "15px", color: "#febd69" }} />
                        <StarRateIcon sx={{ fontSize: "15px", color: "#febd69" }} />
                        <StarRateIcon sx={{ fontSize: "15px", color: "#febd69" }} />
                        <StarRateIcon sx={{ fontSize: "15px", color: "#febd69" }} />
                        <StarOutlineIcon sx={{ fontSize: "15px", color: "#febd69" }} />
                      </div> */}
                      <div className='PriceProductDetailPage'>
                        <div className='CurrencyText'>
                        </div>
                        <div className='RateHomeDetail'>
                        <div className="RateHomeDetailPrice">
                          <span className="discount-price">
                            {GB_CURRENCY.format(item.discount_price_usd)}
                          </span>
                          &nbsp;
                          <span className="original-price">
                            {GB_CURRENCY.format(item.actual_price_usd)}
                          </span>
                        </div>

                          <div className='AddToCartButton' onClick={() => (HandleAddToCart(item))}>
                            Add To Cart
                          </div>
                        </div>
                      </div>
                      <div className='ProductRatings'>
                        {/* Add star ratings */}
                        <ItemRatings avgRating={item.average_rating} ratings={item.no_of_ratings} />
                      </div>
                      <div className='SaleProductPage'>
                        Up to 25% off on Black Friday
                      </div>
                      <div className='DeliveryHomepage'>
                        Free Domestic Shipping By Amazon
                        0</div>
                    </div>
                  </div>
                );
              })
            }



          </div>


        </div>

      </div>
      <ToastContainer />
      <ProductFooter />
    </div>

  )
}
}

export default Product;