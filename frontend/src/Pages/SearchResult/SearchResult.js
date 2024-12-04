import {React, useEffect, useState} from 'react'
import NavBar from "../../Components/Navbar/Navigation";
import { useSearchParams } from 'react-router-dom';
import { callAPI } from '../../Utils/CallAPI';

const SearchResult = () => {
  const [SearchParams] = useSearchParams();
  const [products, setProducts] = useState(null);

  const getSearchResults = () => {
    const searchTerm = SearchParams.get("searchTerm");
    const category = SearchParams.get("category");

    callAPI(`/Data/Product.json`)
    .then((searchResults) => {
      const categoryResults = searchResults[category];
      if (searchTerm) {
        const results = categoryResults.filter(product => product.title.toLowerCase().includes(searchTerm.toLowerCase()));
        setProducts(results);
      } else {
        setProducts(categoryResults);
      }
    });
  };

  useEffect(() => {
    getSearchResults();
  }, [SearchParams]);

  return (
    <div className="searchresult">
      <NavBar />
      {
        products && products.map((product, key) => {
          return (
            <div key={key}>
              {product.title}
            </div>
          )
        })
      }
    </div>
  )
}

export default SearchResult