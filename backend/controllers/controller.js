// const {userRecipeItem} = require('../models/recipeModel')
const exp = require('constants');
const {Item, Expiration, Snapshot} = require('../models/itemModel')

// will store a database of items and their respective expiration date
const getSnapshot = async (req, res) => {

    try {
        const snapResponse = await Snapshot.find({}).sort({date: -1}).limit(1)
        // const oldResponse = await Snapshot.find({}).sort({date: 1}).limit(1)
        // await Snapshot.deleteById({ _id: oldResponse._id})
        // console.log(snapResponse)
        console.log("HERE")
        console.log(snapResponse)
        res.status(200).json(snapResponse)
    } catch (error) {
        res.status(400).json({Error: error.message})
    }
}

const loadExpirationList = async (req, res) => {
    var fs = require('fs').promises;
    var expirationDateList = []

    // add a JSON file into backend/assets & this function will read it
    const readFilePath = "/Users/arsh/Documents/ucla/winter24/ideahacks2024/backend/assets/foodkeeper.json"
    const data = await fs.readFile(readFilePath, 'utf-8');
    var obj = JSON.parse(data);

    // parses through the json and converts it into the document format (CHANGE ACCORDING TO INPUT JSON)
    obj.sheets[2].data.forEach(function (item, idx) {
        if (item.length > 18 && item[17].Refrigerate_Max != null) {
            expirationDateList.push({
                name: item[2].Name,
                fridgeLife: item[17].Refrigerate_Max,
                timeMetric: item[18].Refrigerate_Metric
            })
        }
    })

    // adding to database
    try {
        const expirationCollection = await Expiration.insertMany(expirationDateList)
        res.status(200).json({expirationCollection})
    } catch (error) {
        res.status(400).json({error: error.message})
    }

}

const checkExpiration = () => {
    if (expirationDateList.length == 0) {
        console.log("Expiration Database not intialized")
    }

    // 

}

const getAllItems = async (req, res) => {
    const items = await Item.find({}).sort({expiration_date: -1})
    res.status(200).json({items})
}

const getHeadSortedItems = async (req, res) => {
    const items = await Item.find({}).sort({expiration_date: -1})
    const sortedItems = []
    items.forEach(function (item, idx) {
        age = item.expiration_date.getDate() - item.createdAt.getDate()
        lifetime = item.expiration_date.getDate() - Date()
        item.percentTimeRemaining = age/lifetime
    })


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

    // classify the item [SPARSH's MODEL]

    // find expiration of item

    // create the item
    try {
        const itemCreated = await Item.create({title: title, quantity: quantity})

        res.status(200).json({itemCreated})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const getRecipes = async (req, res) => {
    const {id} = req.params

    const items = []
    const getAllItemsURL = '/api/getAllItems'
    fetch('/api/getAllItems')
      .then(response => {
        if (!response.ok) {
          throw new Error('Could not fetch the items available!');
        }
        items = response.json();
      })
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

module.exports = {
    loadExpirationList,
    getAllItems,
    getHeadSortedItems,
    createItem,
    getItem,
    getRecipes,
    getSnapshot
}