const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();
const json = express.json();
const PORT = 3017;

const AWS = require('aws-sdk');

AWS.config.update({region: 'eu-central-1'});

// app.use(json);
// app.use(fileUpload(options:{
//     limits:{ fileSize: 50 * 1024 * 1024},
// }))

// s3 = new AWS.S3(options:{
//     Credentials:{

//     }
// })