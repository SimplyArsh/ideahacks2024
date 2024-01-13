const express = require('express')
const {
    getAllItems,
    getItem,
    createItem
} = require('../controllers/recipeController')

const router = express.Router()

router.get('/allItems', getAllItems)
router.get('/Item/:id', getItem)
router.post('/createItem', createItem)

module.exports = router