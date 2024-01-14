const express = require('express')
const {
    loadExpirationList,
    getAllItems,
    getHeadSortedItems,
    createItem,
    getItem,
    getRecipes,
    getSnapshot,
    getSnapshotCircle,
    updateItemsInFridge
} = require('../controllers/controller')

const router = express.Router()

router.get('/getAllItems', getAllItems)
router.get('/getItem/:id', getItem)
// router.get('/getHeadSortedItems', getHeadSortedItems) NO LONGER AN API CALL
router.get('/getRecipes', getRecipes)
router.patch('/loadExpirationList', loadExpirationList)
router.post('/createItem', createItem)
router.get('/getSnapshot', getSnapshot)
router.get('/getSnapshotCircle', getSnapshotCircle)
router.get('/updateItemsInFridge', updateItemsInFridge)

module.exports = router