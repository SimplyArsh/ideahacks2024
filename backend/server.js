require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors');
const mongoose = require('mongoose')
const recipe = require('./routes/recipe')

app.use((req, res, next) => {
    next()
})
app.use(express.json())

app.use('/api', recipe)

mongoose.connect(process.env.MONGO_UI)
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);
});


