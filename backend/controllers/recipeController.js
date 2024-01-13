const {Item} = require('../models/recipeModel')


const getAllItems = async (req, res) => {
    const items = await Item.find({}).sort({expiration_date: -1})
    res.status(200).json({items})
}

const getItem = async (req, res) => {
    const { id } = req.params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such Item'})
    }

    const item = await Item.findById(id)

    if (!item) {
        return res.status(404).json({error: 'No such Item'})
    }
}

const createItem = async (req, res) => {
    const {title, quantity} = req.body
    console.log(title)
    try {
        const itemCreated = await Item.create({title: title, quantity: quantity})
        console.log("HERE")
        res.status(200).json({itemCreated})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

module.exports = {
    getAllItems,
    createItem,
    getItem
}