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

const expirationData = new Schema({
    name: {
        type: String,
        required: true
    },
    fridgeLife: {
        type: Number,
        required: true
    },
    timeMetric: {
        type: String,
        required: true
    }
})

const Item = mongoose.model('Item', itemSchema)
const Expiration = mongoose.model('Expiration', expirationData)
module.exports = {
    Item,
    Expiration
}