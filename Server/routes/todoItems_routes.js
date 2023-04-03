const router = require('express').Router();

const todoItemModel = require('../models/todoItems_models');

router.post('/api/additem', async (req,res) =>{
    try{
        const newItem = new todoItemModel({
            item:req.body.item
        })
        const saveItem = await newItem.save();
        res.status(200).json(saveItem)
        // res.status(200).json('Item Added')
    }catch(err){
        res.json(err);
    }
})

router.get('/api/getList', async (req,res) =>{
    try{
        const getAllItems = await todoItemModel.find({});
        res.status(200).json(getAllItems)
    }catch(err){
        res.json(err);
    }
})

router.post('/api/updateitem/:id', async (req,res) =>{
    try{
        const updateItemById = await todoItemModel.findByIdAndUpdate(req.params.id,{$set: req.body});
        res.status(200).json('Item Updated')
    }catch(err){
        res.json(err);
    }
})

router.delete('/api/deleteitem/:id', async (req,res) =>{
    try{
        const updateItemById = await todoItemModel.findByIdAndDelete(req.params.id);
        res.status(200).json('Item Deleted')
    }catch(err){
        res.json(err);
    }
})

module.exports = router;