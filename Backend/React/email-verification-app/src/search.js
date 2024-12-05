import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function SearchProducts() {
    const [products, setProducts] = useState([]); // Store the fetched products
    const [query, setQuery] = useState(""); // Store the search query
    const [isLoading, setIsLoading] = useState(false); // To handle loading state
    const [debounceTimeout, setDebounceTimeout] = useState(null); // For debounce functionality

    // Handle the search input change
    const handleSearchChange = (e) => {
        const searchQuery = e.target.value;
        setQuery(searchQuery);

        if (debounceTimeout) {
            clearTimeout(debounceTimeout); // Clear the previous timeout if any
        }

        // Set a new timeout to delay the API call by 500ms after user stops typing
        setDebounceTimeout(setTimeout(() => {
            fetchProducts(searchQuery);
        }, 500));
    };

    // Fetch products based on the search query
    const fetchProducts = (searchQuery) => {
        if (!searchQuery) {
            setProducts([]); // Clear products if the query is empty
            return;
        }

        setIsLoading(true); // Show loading indicator

        axios
            .get(`/products?query=${searchQuery}`)
            .then((response) => {
                setProducts(response.data.products);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching products:", error);
                setIsLoading(false);
            });
    };

    return (
        <div>
            <h1>Search Products</h1>

            {/* Search Bar */}
            <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                placeholder="Search for products..."
            />

            {/* Loading state */}
            {isLoading && <p>Loading...</p>}

            {/* Product List */}
            <ul>
                {products.length === 0 && !isLoading && query && (
                    <li>No products found for "{query}"</li>
                )}
                {products.map((product) => (
                    <li key={product.id}>
                        <Link to={`/product/${product.id}`}>{product.name}</Link> - ${product.price}
                    </li>
                ))}
            </ul>

            {/* Go to Cart link */}
            <Link to="/cart">Go to Cart</Link>
        </div>
    );
}

export default SearchProducts;
