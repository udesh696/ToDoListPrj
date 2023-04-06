const router = require('express').Router();
const express = require('express')
const multer  = require('multer')

const upload = multer({ dest: 'uploads/' })

const todoItemModel = require('../models/todoItems_models');
const nodemailer = require('nodemailer');

const { uploadFile, getFileStream } = require('../s3util');

router.post('/api/additem', async (req,res) =>{
    try{
        const newItem = new todoItemModel({
            item:req.body.item,
            status:req.body.status
        })
        const saveItem = await newItem.save();
        res.status(200).json(saveItem)
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
        const deleteItemById = await todoItemModel.findByIdAndDelete(req.params.id);
        res.status(200).json('Item Deleted')
    }catch(err){
        res.json(err);
    }
})

router.post('/api/sendemail', async (req,res) =>{
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user:'udesh696@gmail.com',
                pass:'Welcome@123'
            }
        });

        var mailOptions = {
            from: 'udesh696@gmail.com',
            to: 'udesh696@gmail.com',
            subject: 'Sending Email using Node.js',
            text: 'That was easy!'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              res.status(200).json(error)
            } else {
              console.log('Email sent: ' + info.response);
              res.status(200).json(info.response)
            }
          });

        
    }catch(err){
        res.json(err);
    }
})

router.post('/images',upload.single('image'), async (req,res) => {
    const file = req.file;
    const result = await uploadFile(file);
    // const description = req.body.description;
    res.send({imagepath:`/images/${result.Key}`});
})

router.get('/images/:key', async(req,res) => {
    const key = req.params.key;
    const readStream = getFileStream(key);

    readStream.pipe(res);
})

module.exports = router;