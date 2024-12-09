import React from 'react';
import "./ItemDetail.css";
import ItemRatings from "../ItemPage/ItemRatings"

const ItemDetail = ({product, ratings}) => {
  return (
    <div className="items__detail">
        <div className="items__detail__text">
            {product.product_name}
        </div>
        
        {/* <div className="items__detail__text--normal">
            by <span className="items__detail__brand">{product.brand}</span>
        </div> */}
        
        {
            ratings &&
                <div className="items__detail__text--normal">
                    <ItemRatings average_rating={product.average_rating} no_of_ratings={product.no_of_ratings} />
                </div>
        }

    </div>
  )
}

export default ItemDetail