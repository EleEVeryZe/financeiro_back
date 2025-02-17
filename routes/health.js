var express = require("express");
var router = express.Router();

const dns = require("node:dns");
const os = require("node:os");

router.get("/health", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const options = { family: 4 };

  dns.lookup(os.hostname(), options, (err, addr) => {
    if (err) {
        res.send(err);
    } else {
        res.send(`IPv4 address: ${addr}`);
    }
  });  
});

module.exports = router;
