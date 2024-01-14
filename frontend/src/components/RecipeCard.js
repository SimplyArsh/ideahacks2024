import React from 'react';
import '../index.css';

const RecipeCard = ({name, topMargin, ingredients, pantry, image}) => {
    return (
        <div className="recipe-card" marginTop={topMargin}>
            <h3>{name}</h3>
            <div style={{display:"flex"}}>
                <div>
                    <img src={image} className="recipe-image"/>
                </div>
                <div>
                    <h3>From your fridge</h3>
                    <ul className = "ingredient-list">
                        {ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3>From your pantry</h3>
                    <ul className = "pantry-list">
                        {pantry.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
};

export default RecipeCard;