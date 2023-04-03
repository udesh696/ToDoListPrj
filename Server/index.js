const express = require('express');
const mongoose = require('mongoose');
const dotenve = require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;

app.use(cors());

const todoItems_route = require('./routes/todoItems_routes');

mongoose.connect(process.env.DB_CONNECTION)
.then(() => console.log("DB Connected"))
.catch(err => console.log(err))

app.use('/',todoItems_route)


app.listen(PORT, () => console.log("Server Connected"));
