var express = require("express");
var router = express.Router();
const {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
express().use(express.json());
const s3Client = new S3Client({ region: "sa-east-1" });

let registros = [];

const getRegistros = async () => {

  const command = new GetObjectCommand({
    Bucket: "myfinanceiro",
    Key: "financeiro.json",
  });

  const { Body } = await s3Client.send(command);

  const stream = await streamToString(Body);
  registros = JSON.parse(stream);
  return registros;
}

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (registros.length > 0) {
    res.send(registros);
    return;
  }
  res.send(await getRegistros());
});

const sanatizeBody = ({ descricao }) => {
  if (!descricao) return false;
};

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", reject);
  });
}

router.post("/", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (sanatizeBody(req.body) === false) {
    res.status(404).send();
    return;
  }

  registros.push(req.body);

  const command = new PutObjectCommand({
    Bucket: "myfinanceiro",
    Key: "financeiro.json", // File name in S3
    Body: JSON.stringify(registros),
  });

  await s3Client.send(command);

  res.render("index", { title: "Express" });
});


router.put("/", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (sanatizeBody(req.body) === false) {
    res.status(404).send();
    return;
  }

  let reg = registros.filter(reg => reg.id !== req.body.id);
  reg.push(req.body);
  

  const command = new PutObjectCommand({
    Bucket: "myfinanceiro",
    Key: "financeiro.json", // File name in S3
    Body: JSON.stringify(reg),
  });

  await s3Client.send(command);
  registros = reg;
  res.render("index", { title: "Express" });
});


router.put("/bulk", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.body.filter(re => sanatizeBody(req.body) !== false).length > 0) {
    res.status(404).send();
    return;
  }

  let reg = registros.filter(reg => req.body.map(regBody => regBody.id).indexOf(reg.id) === -1);
  req.body.map(x => reg.push(x));  

  const command = new PutObjectCommand({
    Bucket: "myfinanceiro",
    Key: "financeiro.json", // File name in S3
    Body: JSON.stringify(reg),
  });

  await s3Client.send(command);
  registros = reg;
  res.render("index", { title: "Express" });
});


router.delete("/:id", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (!req.params.id) {
    res.status(404).send();
    return;
  }

  if (registros.length == 0)
    await getRegistros(res);
    

  let reg = registros.filter(reg => reg.id !== req.params.id);
  if (req.length === registros.length){
    res.status(404).send();
    return;
  }

  const command = new PutObjectCommand({
    Bucket: "myfinanceiro",
    Key: "financeiro.json", // File name in S3
    Body: JSON.stringify(reg),
  });

  await s3Client.send(command);
  registros = reg;
  res.render("index", { title: "Express" });
});


router.post("/restore", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.body.filter(re => sanatizeBody(req.body) !== false).length > 0) {
    res.status(404).send();
    return;
  }

  registros = req.body;

  const command = new PutObjectCommand({
    Bucket: "myfinanceiro",
    Key: "financeiro.json", // File name in S3
    Body: JSON.stringify(registros),
  });

  await s3Client.send(command);

  res.render("index", { title: "Express" });
});


router.post("/bulk", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.body.filter(re => sanatizeBody(req.body) !== false).length > 0) {
    res.status(404).send();
    return;
  }

  registros = [...registros, ...req.body];

  const command = new PutObjectCommand({
    Bucket: "myfinanceiro",
    Key: "financeiro.json", // File name in S3
    Body: JSON.stringify(registros),
  });

  await s3Client.send(command);

  res.render("index", { title: "Express" });
});

module.exports = router;
