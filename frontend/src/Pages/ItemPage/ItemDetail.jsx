import React from 'react';
import "./ItemDetail.css";
import ItemRatings from "../ItemPage/ItemRatings"

const ItemDetail = ({product, ratings}) => {
  return (
    <div className="items__detail">
        <div className="items__detail__text">
            {product.name}
        </div>
        
        <div className="items__detail__text--normal">
            by <span className="items__detail__brand">{product.brand}</span>
        </div>
        
        {
            ratings &&
                <div className="items__detail__text--normal">
                    <ItemRatings avgRating={product.avgRating} ratings={product.ratings} />
                </div>
        }

    </div>
  )
}

export default ItemDetail