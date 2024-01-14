// const {userRecipeItem} = require('../models/recipeModel')
const exp = require('constants');
const sharp = require('sharp');
const spawn = require("child_process").spawn;
const {Item, Expiration, Snapshot} = require('../models/itemModel')
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async');

// will store a database of items and their respective expiration date
const getSnapshot = async (req, res) => {

    try {
        const snapResponse = await Snapshot.find({}).sort({date: -1}).limit(1)
        // const oldResponse = await Snapshot.find({}).sort({date: 1}).limit(1)
        // await Snapshot.deleteById({ _id: oldResponse._id})
        // console.log(snapResponse)
        res.status(200).json(snapResponse)
    } catch (error) {
        res.status(400).json({Error: error.message})
    }

}

const getSnapshotCircle = async (req, res) => {
    const {numberDigit} = req.query
    const a = new Int32Array(1)
    a[0] = numberDigit
    try {
        const snapResponse = await Snapshot.find({number: a[0]}).exec()
        // const oldResponse = await Snapshot.find({}).sort({date: 1}).limit(1)
        // await Snapshot.deleteById({ _id: oldResponse._id})
        // console.log(snapResponse)
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
        const ageInDays = await Expiration.insertMany(expirationDateList)
        res.status(200).json({ageInDays})
    } catch (error) {
        res.status(400).json({error: error.message})
    }

}

const deleteAll = async () => {
    const expirationCollection = await Expiration.deleteMany({})
    res.status(200).json(expirationCollection)
}

const getExpirationDate = async (name_) => {
    
    try {
        const expirationCollection = await Expiration.find({name: name_})
        if (expirationCollection.fridgeLife == null) {
            return expirationCollection[0].fridgeLife 
        } else {
            console.log(expirationCollection.fridgeLife)
            return expirationCollection.fridgeLife
        }
        
    } catch (error) {
        console.log(name_)
        console.log(error)
    }
}

const getAllItems = async (req, res) => {
    const items = await Item.find({}).sort({expiration_date: -1})

    const finalItems = items.map( (item)=> {
        const currTime = new Date ()
        let Difference_In_Time = item.expiration_date.getTime() - currTime.getTime();
        let Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));

        return ({
            "name": item.title,
            "daysLeft": Difference_In_Days
        })
    })

    res.status(200).json(finalItems)
}

const getHeadSortedItems = async () => {
    const items = await Item.find({}).sort({expiration_date: -1})
    const itemsAge = []

    items.forEach(function (item, idx) {
        age = Math.abs(item.expiration_date - item.createdAt)
        lifetime = Math.abs(item.expiration_date - new Date())
        if (age/lifetime >= 0) {
            itemsAge.push({item : item.title, percentTimeRemaining : age/lifetime})
        }
    })

    const sortedItems = itemsAge.sort(function (a, b) {
        return a.percentTimeRemaining - b.percentTimeRemaining
    })

    if (sortedItems.length > 6) {
        return sortedItems.slice(0, 6)
    } else {
        return sortedItems
    }
    
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

    Date.prototype.addHours= function(h){
        this.setHours(this.getHours()+h);
        return this;
    }

    const expiration = new Date ().addHours(20)
    console.log(expiration)
    try {
        const itemCreated = await Item.create({title: title, quantity: quantity, expiration_date: expiration})
        res.status(200).json({itemCreated})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}


const updateItemsInFridge = async () => {

    var data_ = []
    try {
        const snapResponse = await Snapshot.find({}).sort({date: -1}).limit(1)


        let buffer = Buffer.from(snapResponse[0].data.buffer);
        let capturedItems_ = ""
        // If the original data was a string, you can convert the buffer to a string
        let originalString = buffer.toString('base64');
        
        const PYTHON_PATH = "/Users/arsh/Documents/ucla/winter24/ideahacks2024/backend/controllers/test.py"

        const cnn = () => {
            return new Promise((resolve) => {
                const pythonProcess = spawn('python',[PYTHON_PATH, originalString, 2]);

                pythonProcess.stdout.on('data', (data) => {
                    capturedItems_ = data.toString().slice(0, -1)
                });

                pythonProcess.on('close', (code) => {
                    if (code !== 0) {
                        reject(`Process exited with code ${code}`);
                    } else {
                        resolve(capturedItems_);
                     }
                });
            })
        }
        
        await cnn() 
        
        const capturedItems = capturedItems_.split(",")
        console.log(capturedItems)

        const itemChanged = []

        async function checkPresence () {
            for(const item of capturedItems) {
                const itemExists = await Item.exists({title: item})
                // console.log(item)
                if (!itemExists) {
                    const age = await getExpirationDate(item)
                    // console.log(age)
                    Date.prototype.addHours= function(h){
                        this.setHours(this.getHours()+h);
                        return this;
                    }
                    const expiration = new Date ().addHours(age*24)

                    try {
                        const itemCreated = await Item.create({title: item, quantity: 1, expiration_date: expiration})
                        itemChanged.push(itemCreated)
                        // console.log("ADDITION: ")
                        // console.log(itemCreated)
                    } catch (error) {
                        console.log("There was an error in creating the new document.")
                    }
                }
            }
        }
        await checkPresence ()

        try {
            const prevItems = await Item.deleteMany({title: { $nin: capturedItems}})
            itemChanged.push(prevItems)
            // console.log("DELETE: ")
            // console.log(prevItems)
        } catch (error) {
            console.log("Error with retrieving all items")
        }

        return itemChanged

    } catch (error) {
        console.log("error")
    }
}

const timer = setIntervalAsync(async () => {
    await updateItemsInFridge()
}, 10000);

const getRecipes = async (req, res) => {
    const {Items} = req.query

    const sortedItems = await getHeadSortedItems()

    const orders = []
    const itemsPerRecipe = Math.min(Items, sortedItems.length)
    for (let idx = 0; idx < sortedItems.length; idx++) {
        var itemsPerOrder = ""
        for (let idx = 0; idx < itemsPerRecipe; idx++) {
            itemsPerOrder += (sortedItems[Math.floor(Math.random() * sortedItems.length)].item) + ','
        }
        orders.push(itemsPerOrder.slice(0, -1))
    }

    const smallOrders = orders.slice(0, 2)
    console.log(orders)

    async function processArray(orders) {

        const promises = orders.map(order => {

            const API_KEY = "612300b5b3ec448aa78f7e613d4e6d7e"
            const spoonURL = "https://api.spoonacular.com/recipes/complexSearch?" + new URLSearchParams({
                apiKey: API_KEY,
                includeIngredients: order,
                number: 1,
                fillIngredients: true
            })

            return fetch(spoonURL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('There was an error procesing order', order, error);
                return null;
            });
            // console.log(item)

        })
        console.log('Done!');
        return Promise.all(promises)
        
    }

    const intervalID = setInterval(sayHello, 1000)


    // async function expiration () {
    //     const lowest = []
    //     for(const item of capturedItems) {
    //         const itemExists = await Item.find({title: item})

    //         const currTime = new Date ()
    //         let Difference_In_Time = itemExists.expiration_date.getTime() - currTime.getTime();
    //         let Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
    //         lowest.push(Difference_In_Days)

    //     }
    //     return {"name":  , "expiration": Math.min(...lowest)}

    // }

    const expiringSoon = await expiration(); 
    
    processArray(orders).then((response) => {

        if (item == null) {
            res.status(200).json({})
        }

        const recipes = response.map( (item) => {

            if (item.results.length != 0) {

                const includedIngredients = item.results[0].usedIngredients.map( (item) => {
                    return(item.name)
                })
    
                const missingIngredients = item.results[0].missedIngredients.map( (item) => {
                    return(item.name)
                })

                return ({
                    "id": item.results[0].id,
                    "name": item.results[0].title,
                    "image": item.results[0].image,
                    "includedIngredients":includedIngredients,
                    "missingIngredients":missingIngredients
                })
            }

        })

        const finalResponse = recipes.filter((item) => item != null)
        res.status(200).json(finalResponse)

    })


}

module.exports = {
    loadExpirationList,
    getAllItems,
    getHeadSortedItems,
    createItem,
    getItem,
    getRecipes,
    getSnapshot,
    getSnapshotCircle,
    updateItemsInFridge
}


// ARCHIVED CODE ; DONT DELETE ; MIGHT RESUSE LATER

    // const recipes = () => {

    //     return Promise.all(

    //         smallOrders.map(async (order) => {

    //             const API_KEY = "612300b5b3ec448aa78f7e613d4e6d7e"
    //             const spoonURL = "https://api.spoonacular.com/recipes/complexSearch?" + new URLSearchParams({
    //                 apiKey: API_KEY,
    //                 includeIngredients: order,
    //                 number: 1
    //             })

    //             try {

    //                 const response = await fetch (spoonURL, {
    //                     method: 'GET',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     }
    //                 })

    //                 const item = await response.json()
    //                 console.log(item)
    //                 recipesResponse.push(item)
                    

    //             } catch (error) {
    //                 console.log('There was an error', error);
    //             }

    //         })).then(() => {

    //             console.log('Items processed');

    //         });

    //   };

        // fetch('/api/getHeadSortedItems').then(
    //     (response) => {
    //         if (!response.ok) {
    //             throw new Error('Error getting sorted item!')
    //         }
    //         return response.json();
    //     }).then( (data) => {
    //         res.status(200).json({sortedItems})
    //     })


    // response = [
    //     {
    //         "results": [
    //             {
    //                 "id": 640134,
    //                 "usedIngredientCount": 2,
    //                 "missedIngredientCount": 8,
    //                 "missedIngredients": [
    //                     {
    //                         "id": 2004,
    //                         "amount": 2,
    //                         "unit": "",
    //                         "unitLong": "",
    //                         "unitShort": "",
    //                         "aisle": "Spices and Seasonings",
    //                         "name": "bay leaves",
    //                         "original": "2 Bay Leaves",
    //                         "originalName": "Bay Leaves",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/bay-leaves.jpg"
    //                     },
    //                     {
    //                         "id": 11109,
    //                         "amount": 2,
    //                         "unit": "lb",
    //                         "unitLong": "pounds",
    //                         "unitShort": "lb",
    //                         "aisle": "Produce",
    //                         "name": "cabbage",
    //                         "original": "1 (2 lb.) cabbage, cut into wedges",
    //                         "originalName": "cabbage, cut into wedges",
    //                         "meta": [
    //                             "cut into wedges"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/cabbage.jpg"
    //                     },
    //                     {
    //                         "id": 11124,
    //                         "amount": 8,
    //                         "unit": "medium",
    //                         "unitLong": "mediums",
    //                         "unitShort": "medium",
    //                         "aisle": "Produce",
    //                         "name": "carrots",
    //                         "original": "8 mediums Carrots, Pared",
    //                         "originalName": "s Carrots, Pared",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/sliced-carrot.png"
    //                     },
    //                     {
    //                         "id": 11215,
    //                         "amount": 1,
    //                         "unit": "Clove",
    //                         "unitLong": "Clove",
    //                         "unitShort": "Clove",
    //                         "aisle": "Produce",
    //                         "name": "garlic",
    //                         "original": "1 Clove Garlic",
    //                         "originalName": "Garlic",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/garlic.png"
    //                     },
    //                     {
    //                         "id": 10511282,
    //                         "amount": 8,
    //                         "unit": "medium",
    //                         "unitLong": "mediums",
    //                         "unitShort": "medium",
    //                         "aisle": "Produce",
    //                         "name": "onions",
    //                         "original": "8 mediums yellow onions, peeled",
    //                         "originalName": "s yellow onions, peeled",
    //                         "meta": [
    //                             "yellow",
    //                             "peeled"
    //                         ],
    //                         "extendedName": "yellow onions",
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/brown-onion.png"
    //                     },
    //                     {
    //                         "id": 11297,
    //                         "amount": 6,
    //                         "unit": "servings",
    //                         "unitLong": "servings",
    //                         "unitShort": "servings",
    //                         "aisle": "Spices and Seasonings",
    //                         "name": "parsley",
    //                         "original": "Chopped parsley",
    //                         "originalName": "Chopped parsley",
    //                         "meta": [
    //                             "chopped"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/parsley.jpg"
    //                     },
    //                     {
    //                         "id": 10111333,
    //                         "amount": 10,
    //                         "unit": "",
    //                         "unitLong": "",
    //                         "unitShort": "",
    //                         "aisle": "Produce",
    //                         "name": "peppers",
    //                         "original": "10 Whole black Peppers",
    //                         "originalName": "Whole black Peppers",
    //                         "meta": [
    //                             "whole",
    //                             "black"
    //                         ],
    //                         "extendedName": "black whole peppers",
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/green-pepper.jpg"
    //                     },
    //                     {
    //                         "id": 11352,
    //                         "amount": 8,
    //                         "unit": "medium",
    //                         "unitLong": "mediums",
    //                         "unitShort": "medium",
    //                         "aisle": "Produce",
    //                         "name": "potatoes",
    //                         "original": "8 mediums Potatoes, pared",
    //                         "originalName": "s Potatoes, pared",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/potatoes-yukon-gold.png"
    //                     }
    //                 ],
    //                 "usedIngredients": [
    //                     {
    //                         "id": 1001,
    //                         "amount": 1,
    //                         "unit": "tbsp",
    //                         "unitLong": "tablespoon",
    //                         "unitShort": "Tbsp",
    //                         "aisle": "Milk, Eggs, Other Dairy",
    //                         "name": "butter",
    //                         "original": "1 tbsp. butter, melted",
    //                         "originalName": "butter, melted",
    //                         "meta": [
    //                             "melted"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/butter-sliced.jpg"
    //                     },
    //                     {
    //                         "id": 13023,
    //                         "amount": 5,
    //                         "unit": "pounds",
    //                         "unitLong": "pounds",
    //                         "unitShort": "lb",
    //                         "aisle": "Meat",
    //                         "name": "corned-beef brisket",
    //                         "original": "5 pounds Corned-Beef brisket",
    //                         "originalName": "Corned-Beef brisket",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/beef-brisket.png"
    //                     }
    //                 ],
    //                 "unusedIngredients": [],
    //                 "likes": 0,
    //                 "title": "Corned Beef and Cabbage",
    //                 "image": "https://spoonacular.com/recipeImages/640134-312x231.jpg",
    //                 "imageType": "jpg"
    //             }
    //         ],
    //         "offset": 0,
    //         "number": 1,
    //         "totalResults": 43
    //     },
    //     {
    //         "results": [],
    //         "offset": 0,
    //         "number": 1,
    //         "totalResults": 0
    //     },
    //     {
    //         "results": [
    //             {
    //                 "id": 640134,
    //                 "usedIngredientCount": 2,
    //                 "missedIngredientCount": 8,
    //                 "missedIngredients": [
    //                     {
    //                         "id": 2004,
    //                         "amount": 2,
    //                         "unit": "",
    //                         "unitLong": "",
    //                         "unitShort": "",
    //                         "aisle": "Spices and Seasonings",
    //                         "name": "bay leaves",
    //                         "original": "2 Bay Leaves",
    //                         "originalName": "Bay Leaves",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/bay-leaves.jpg"
    //                     },
    //                     {
    //                         "id": 11109,
    //                         "amount": 2,
    //                         "unit": "lb",
    //                         "unitLong": "pounds",
    //                         "unitShort": "lb",
    //                         "aisle": "Produce",
    //                         "name": "cabbage",
    //                         "original": "1 (2 lb.) cabbage, cut into wedges",
    //                         "originalName": "cabbage, cut into wedges",
    //                         "meta": [
    //                             "cut into wedges"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/cabbage.jpg"
    //                     },
    //                     {
    //                         "id": 11124,
    //                         "amount": 8,
    //                         "unit": "medium",
    //                         "unitLong": "mediums",
    //                         "unitShort": "medium",
    //                         "aisle": "Produce",
    //                         "name": "carrots",
    //                         "original": "8 mediums Carrots, Pared",
    //                         "originalName": "s Carrots, Pared",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/sliced-carrot.png"
    //                     },
    //                     {
    //                         "id": 11215,
    //                         "amount": 1,
    //                         "unit": "Clove",
    //                         "unitLong": "Clove",
    //                         "unitShort": "Clove",
    //                         "aisle": "Produce",
    //                         "name": "garlic",
    //                         "original": "1 Clove Garlic",
    //                         "originalName": "Garlic",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/garlic.png"
    //                     },
    //                     {
    //                         "id": 10511282,
    //                         "amount": 8,
    //                         "unit": "medium",
    //                         "unitLong": "mediums",
    //                         "unitShort": "medium",
    //                         "aisle": "Produce",
    //                         "name": "onions",
    //                         "original": "8 mediums yellow onions, peeled",
    //                         "originalName": "s yellow onions, peeled",
    //                         "meta": [
    //                             "yellow",
    //                             "peeled"
    //                         ],
    //                         "extendedName": "yellow onions",
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/brown-onion.png"
    //                     },
    //                     {
    //                         "id": 11297,
    //                         "amount": 6,
    //                         "unit": "servings",
    //                         "unitLong": "servings",
    //                         "unitShort": "servings",
    //                         "aisle": "Spices and Seasonings",
    //                         "name": "parsley",
    //                         "original": "Chopped parsley",
    //                         "originalName": "Chopped parsley",
    //                         "meta": [
    //                             "chopped"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/parsley.jpg"
    //                     },
    //                     {
    //                         "id": 10111333,
    //                         "amount": 10,
    //                         "unit": "",
    //                         "unitLong": "",
    //                         "unitShort": "",
    //                         "aisle": "Produce",
    //                         "name": "peppers",
    //                         "original": "10 Whole black Peppers",
    //                         "originalName": "Whole black Peppers",
    //                         "meta": [
    //                             "whole",
    //                             "black"
    //                         ],
    //                         "extendedName": "black whole peppers",
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/green-pepper.jpg"
    //                     },
    //                     {
    //                         "id": 11352,
    //                         "amount": 8,
    //                         "unit": "medium",
    //                         "unitLong": "mediums",
    //                         "unitShort": "medium",
    //                         "aisle": "Produce",
    //                         "name": "potatoes",
    //                         "original": "8 mediums Potatoes, pared",
    //                         "originalName": "s Potatoes, pared",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/potatoes-yukon-gold.png"
    //                     }
    //                 ],
    //                 "usedIngredients": [
    //                     {
    //                         "id": 1001,
    //                         "amount": 1,
    //                         "unit": "tbsp",
    //                         "unitLong": "tablespoon",
    //                         "unitShort": "Tbsp",
    //                         "aisle": "Milk, Eggs, Other Dairy",
    //                         "name": "butter",
    //                         "original": "1 tbsp. butter, melted",
    //                         "originalName": "butter, melted",
    //                         "meta": [
    //                             "melted"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/butter-sliced.jpg"
    //                     },
    //                     {
    //                         "id": 13023,
    //                         "amount": 5,
    //                         "unit": "pounds",
    //                         "unitLong": "pounds",
    //                         "unitShort": "lb",
    //                         "aisle": "Meat",
    //                         "name": "corned-beef brisket",
    //                         "original": "5 pounds Corned-Beef brisket",
    //                         "originalName": "Corned-Beef brisket",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/beef-brisket.png"
    //                     }
    //                 ],
    //                 "unusedIngredients": [],
    //                 "likes": 0,
    //                 "title": "Corned Beef and Cabbage",
    //                 "image": "https://spoonacular.com/recipeImages/640134-312x231.jpg",
    //                 "imageType": "jpg"
    //             }
    //         ],
    //         "offset": 0,
    //         "number": 1,
    //         "totalResults": 43
    //     },
    //     {
    //         "results": [
    //             {
    //                 "id": 782619,
    //                 "usedIngredientCount": 2,
    //                 "missedIngredientCount": 6,
    //                 "missedIngredients": [
    //                     {
    //                         "id": 1123,
    //                         "amount": 4,
    //                         "unit": "large",
    //                         "unitLong": "larges",
    //                         "unitShort": "large",
    //                         "aisle": "Milk, Eggs, Other Dairy",
    //                         "name": "eggs",
    //                         "original": "4 large eggs",
    //                         "originalName": "eggs",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/egg.png"
    //                     },
    //                     {
    //                         "id": 10211215,
    //                         "amount": 1,
    //                         "unit": "",
    //                         "unitLong": "",
    //                         "unitShort": "",
    //                         "aisle": "Produce",
    //                         "name": "garlic clove",
    //                         "original": "1 garlic clove, cut in half",
    //                         "originalName": "garlic clove, cut in half",
    //                         "meta": [
    //                             "cut in half"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/garlic.jpg"
    //                     },
    //                     {
    //                         "id": 1159,
    //                         "amount": 2,
    //                         "unit": "ounces",
    //                         "unitLong": "ounces",
    //                         "unitShort": "oz",
    //                         "aisle": "Cheese",
    //                         "name": "goat cheese",
    //                         "original": "2 ounces goat cheese, crumbled",
    //                         "originalName": "goat cheese, crumbled",
    //                         "meta": [
    //                             "crumbled"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/goat-cheese.jpg"
    //                     },
    //                     {
    //                         "id": 1012042,
    //                         "amount": 1,
    //                         "unit": "teaspoon",
    //                         "unitLong": "teaspoon",
    //                         "unitShort": "tsp",
    //                         "aisle": "Spices and Seasonings",
    //                         "name": "herbes de provence",
    //                         "original": "1 teaspoon herbes de Provence",
    //                         "originalName": "herbes de Provence",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/dried-herbs.png"
    //                     },
    //                     {
    //                         "id": 11260,
    //                         "amount": 16,
    //                         "unit": "ounces",
    //                         "unitLong": "ounces",
    //                         "unitShort": "oz",
    //                         "aisle": "Produce",
    //                         "name": "mushrooms",
    //                         "original": "16 ounces sliced mushrooms",
    //                         "originalName": "sliced mushrooms",
    //                         "meta": [
    //                             "sliced"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/mushrooms.png"
    //                     },
    //                     {
    //                         "id": 11677,
    //                         "amount": 4,
    //                         "unit": "large",
    //                         "unitLong": "larges",
    //                         "unitShort": "large",
    //                         "aisle": "Produce",
    //                         "name": "shallots",
    //                         "original": "4 large shallots, sliced",
    //                         "originalName": "shallots, sliced",
    //                         "meta": [
    //                             "sliced"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/shallots.jpg"
    //                     }
    //                 ],
    //                 "usedIngredients": [
    //                     {
    //                         "id": 10018029,
    //                         "amount": 4,
    //                         "unit": "slices",
    //                         "unitLong": "slices",
    //                         "unitShort": "slice",
    //                         "aisle": "Bakery/Bread",
    //                         "name": "crusty bread",
    //                         "original": "4 slices of crusty bread",
    //                         "originalName": "crusty bread",
    //                         "meta": [],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/crusty-bread.jpg"
    //                     },
    //                     {
    //                         "id": 1001,
    //                         "amount": 1,
    //                         "unit": "Tablespoon",
    //                         "unitLong": "Tablespoon",
    //                         "unitShort": "Tbsp",
    //                         "aisle": "Milk, Eggs, Other Dairy",
    //                         "name": "ghee",
    //                         "original": "1 Tablespoon ghee or butter, divided",
    //                         "originalName": "ghee or butter, divided",
    //                         "meta": [
    //                             "divided"
    //                         ],
    //                         "image": "https://spoonacular.com/cdn/ingredients_100x100/butter-sliced.jpg"
    //                     }
    //                 ],
    //                 "unusedIngredients": [],
    //                 "likes": 0,
    //                 "title": "Mushroom Goat Cheese Baked Eggs",
    //                 "image": "https://spoonacular.com/recipeImages/782619-312x231.png",
    //                 "imageType": "png"
    //             }
    //         ],
    //         "offset": 0,
    //         "number": 1,
    //         "totalResults": 87
    //     },
    //     {
    //         "results": [],
    //         "offset": 0,
    //         "number": 1,
    //         "totalResults": 715
    //     },
    //     {
    //         "results": [],
    //         "offset": 0,
    //         "number": 1,
    //         "totalResults": 0
    //     }
    // ]