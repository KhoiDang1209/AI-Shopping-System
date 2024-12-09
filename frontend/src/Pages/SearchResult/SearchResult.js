import React, { useEffect, useState } from 'react';
import NavBar from "../../Components/Navbar/Navigation";
import Footer from '../../Components/Footer/Footer';
import { Link, useSearchParams } from 'react-router-dom';
import "./SearchResult.css";
import ItemDetail from '../ItemPage/ItemDetail';
import { GB_CURRENCY } from '../../Utils/constants';

const SearchResult = () => {
  const [SearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const searchTermFromParams = SearchParams.get("searchTerm") || '';
    setSearchTerm(searchTermFromParams);

    fetch(`http://localhost:8000/products/search?query=${encodeURIComponent(searchTermFromParams)}`)
      .then((searchResults) => {
        const products = searchResults.Product || [];
        const results = products.filter((product) =>
          product.name.toLowerCase().includes(searchTermFromParams.toLowerCase())
        );
        setProducts(results);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  }, [SearchParams]); // Ensure it updates when SearchParams changes

  return (
    <div className="searchresult">
      <NavBar />
      {
        products && products.map((product, key) => {
          return (
            <Link className="searchresult__link" key={key} to={`/Item/${product.product_id}`}>
                <div className="searchresult__container">
                  <div className="searchresult__image">
                    <img                   
                      className="searchresult__image__img"
                      src={product.product_image}
                      alt={product.product_name}
                    />
                  </div>

                  <div className="searchresult__textbox">
                    <div className="searchresult__text">
                      <ItemDetail product={product} ratings={true}/>
                      <div className="searchresult__detail">
                        {GB_CURRENCY.format(product.discount_price_usd)}
                      </div>
                    </div>
                  </div>
                </div>
            </Link>
          )
        })
      }
      <Footer />
    </div>
  );
};

export default SearchResult;