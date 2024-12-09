import React from 'react';
import StarIcon from '@mui/icons-material/Star';  // For filled stars
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';  // For unfilled stars
import "./ItemRatings.css";

const ItemRatings = (props) => {
    const startNumber = props.average_rating;  // Average rating (1 to 5)
    const ratingNumber = props.no_of_ratings;  // Number of ratings

    return (
        <div className="items__rating">
            {Array.from({ length: startNumber }, (_, i) => (
                <StarIcon key={i} className="items__rating__start" />
            ))}

            {Array.from({ length: 6 - startNumber }, (_, i) => (
                <StarBorderOutlinedIcon key={i} className="items__rating__start--notfull" />
            ))}

            <span className="items__rating__text">
                {ratingNumber} ratings
            </span>
        </div>
    );
};

export default ItemRatings;
