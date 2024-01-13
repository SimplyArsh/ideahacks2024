const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userRecipe = new Schema({
    title: {
        type: String, 
        required: true
    },
    ingredients: {
        type: [{String, Number}], //name and quantity of ingredient
        required: true
    },
}, {
    timestamps: true
})

const userRecipeItem = mongoose.model('userRecipe', userRecipe)
module.exports = {
    userRecipeItem
}