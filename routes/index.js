var express = require('express');
var router = express.Router();
const { PutObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({ region: "sa-east-1" });

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const command = new GetObjectCommand({
    Bucket: "myfinanceiro", 
    Key: "financeiro.json"
});

  const { Body } = await s3Client.send(command);
  res.send(await streamToString(Body));
});

const sanatizeBody = () => {
  
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", reject);
  });
}

router.post('/', async function(req, res, next) {

  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
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
