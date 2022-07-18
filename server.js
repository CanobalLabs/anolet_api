require('newrelic');
const express = require("express");
const { ValidationError } = require('express-validation');
const app = express();
const cors = require('cors');
require("./modules/Mongoose");
app.use(express.json());

app.use(cors())
app.use("*", require("./modules/CheckAuth"));

app.use(function(req, res, next) {
  res.removeHeader("x-powered-by");
  res.setHeader('x-platform', process.platform)
  res.setHeader('x-pid', process.pid)
  res.setHeader('x-ppid', process.ppid)
  next();
});

// Import Routes
const UserRoute = require("./routes/user.js");
const LoginRoute = require("./routes/login.js");
const GameRoute = require("./routes/game.js");
const ItemRoute = require("./routes/item.js");

// Use Routes
app.use("/login", LoginRoute);
app.use("/user", UserRoute);
app.use("/game", GameRoute);
app.use("/item", ItemRoute);

const nodeHtmlToImage = require('node-html-to-image');
app.get(`/ip`, async function(req, res) {
  const image = await nodeHtmlToImage({
    html: `<html><body><center><h1>Your IP Address: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}</h1></center></body></html>`
  });
  res.writeHead(200, { 'Content-Type': 'image/png' });
  res.end(image, 'binary');
});

// Error Handler
app.use(function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err)
  } else {
    console.error(err)
    return res.status(500).send(err)
  }
});

process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});

// Start Server
app.listen(process.env.PORT || 8080, () => {
  console.log("Server Started");
});