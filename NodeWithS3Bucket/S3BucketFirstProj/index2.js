const express = require('express')
const multer  = require('multer')
// const AWS = require('aws-sdk');

const upload = multer({ dest: 'uploads/' })

const { uploadFile, getFileStream } = require('./s3');
// const s3 = new AWS.S3();
// s3.putObject({})

const app = express();

app.post('/images',upload.single('image'), async (req,res) => {
    const file = req.file;
    console.log(file);
    const result = await uploadFile(file);
    console.log(result);
    const description = req.body.description;
    console.log(description);
    res.send({imagepath:`/images/${result.Key}`});
})

app.get('/images/:key', async(req,res) => {
    const key = req.params.key;
    const readStream = getFileStream(key);

    readStream.pipe(res);
})

app.listen(8080, () => console.log('Listning on port 8080'));