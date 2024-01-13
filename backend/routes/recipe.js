const express = require('express')
const {
    loadExpirationList,
    getAllItems,
    getHeadSortedItems,
    createItem,
    getItem,
    getRecipes
} = require('../controllers/controller')

const router = express.Router()

router.get('/getAllItems', getAllItems)
router.get('/getItem/:id', getItem)
router.get('/getHeadSortedItems', getHeadSortedItems)
router.get('getRecipes', getRecipes)
router.patch('/loadExpirationList', loadExpirationList)
router.post('/createItem', createItem)

module.exports = router