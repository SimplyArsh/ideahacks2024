require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const recipe = require('./routes/recipe')

app.use((req, res, next) => {
    next()
})

app.use('/api/recipe', recipe)

mongoose.connect(process.env.MONGO_UI)
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log('connected!')
    })
})
.catch((error) => {
    console.log(error)
})

app.listen(process.env.PORT, () => {
    console.log('Listening on port 4000!')
})

