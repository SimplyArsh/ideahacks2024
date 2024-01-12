const mongoose = require('mongoose')
const Schema = mongoose.Schema


const itemSchema = new Schema({
    title: {
        type: String, 
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    expiration_date: {
        type: Date,
        required: false
    }
}, {
    timestamps: true
})

const Item = mongoose.model('Item', itemSchema)
module.exports = {
    Item: Item
}