const mongoose = require('mongoose');

const ToDoItemSchema = new mongoose.Schema(
    {
        item:{
            type:String,
            required:true
        }
    }
)

module.exports = mongoose.model('todo',ToDoItemSchema); 