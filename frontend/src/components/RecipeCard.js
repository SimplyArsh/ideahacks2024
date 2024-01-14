import React from 'react';
import '../index.css';

const RecipeCard = ({name, topMargin, ingredients, pantry, image, myColor}) => {
    return (
        <div className="recipe-card" style={{ backgroundColor:myColor, marginTop: topMargin }}>
            <h3>{name}</h3>
            <div style={{display:"flex"}}>
                <div>
                    <img src={image} className="recipe-image" alt="recipeImage"/>
                </div>
                <div className="fridge">
                    <h3>From your fridge</h3>
                    <ul className = "ingredient-list">
                        {ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </div>
                <div className="pantry">
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