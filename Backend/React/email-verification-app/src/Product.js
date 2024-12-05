import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

function ProductDetail() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        axios
            .get(`/products/${productId}`)
            .then((response) => setProduct(response.data.product))
            .catch((error) => console.error("Error fetching product:", error));
    }, [productId]);

    const addToCart = () => {
        axios
            .post("/cart/add", { product_id: productId, quantity })
            .then(() => alert("Product added to cart"))
            .catch((error) => console.error("Error adding to cart:", error));
    };

    if (!product) return <div>Loading...</div>;

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <p><strong>Stock:</strong> {product.stock}</p>
            <input
                type="number"
                value={quantity}
                min="1"
                max={product.stock}
                onChange={(e) => setQuantity(e.target.value)}
            />
            <button onClick={addToCart}>Add to Cart</button>
            <br />
            <Link to="/search">Back to Search</Link>
        </div>
    );
}

export default ProductDetail;
