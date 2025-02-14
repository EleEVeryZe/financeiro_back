var express = require('express');
var router = express.Router();
const { PutObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({ region: process.env.AWS_REGION });


/* GET home page. */
router.get('/', async function(req, res, next) {  
  const command = new GetObjectCommand({
    Bucket: "myfinanceiro", 
    Key: "financeiro.json"
});

  const { body } = await s3Client.send(command);
  res.send(body);
});

const sanatizeBody = () => {
  
}

router.post('/', async function(req, res, next) {
  
  sanatizeBody(req.body);

  const command = new PutObjectCommand({
    Bucket: "myfinanceiro",
    Key: "financeiro.json", // File name in S3
    Body: JSON.stringify(req.body),
});

  await s3Client.send(command);
  
  res.render('index', { title: 'Express' });
});

module.exports = router;
