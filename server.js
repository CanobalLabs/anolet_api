require('newrelic');
const express = require("express");
const { ValidationError } = require('express-validation');
const app = express();
const cors = require('cors');
const { createClient } = require("redis");
require("./modules/Mongoose");
app.use(express.json());

app.use(cors())
app.use("*", require("./modules/CheckAuth"));

const client = createClient({
  url: process.env.REDIS_URL || process.env.REDIS_TLS_URL
});

client.on('error', function (err) {
  console.error('Redis error:', err);
});

client.connect();

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
const ACCService = require("./routes/item.js")(client);

// Use Routes
app.use("/login", LoginRoute);
app.use("/user", UserRoute);
app.use("/game", GameRoute);
app.use("/item", ItemRoute);
app.use("/ACCService", ACCService);

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