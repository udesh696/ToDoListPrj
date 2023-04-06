const mongoose = require('mongoose');

const ToDoItemSchema = new mongoose.Schema(
    {
        item:{
            type:String,
            required:false
        },
        status:{
            type:Boolean,
            required:true
        },
        imagekey:{
            type:String,
            required:false
        }
    }
)

module.exports = mongoose.model('todo',ToDoItemSchema); 