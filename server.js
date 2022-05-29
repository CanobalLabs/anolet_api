const express = require("express");
const { ValidationError } = require('express-validation')
const app = express();
const fs = require("fs");
const https = require("https");
require("./modules/Mongoose");
app.use(express.json());

app.use("*", require("./modules/CheckAuth"))

app.get('/usr/:id', (req, res) => {
  const cryptr = require("./modules/Cryptr.js")
  res.send(cryptr.encrypt(req.params.id));
  // res.sendFile(__dirname + '/views/index.html');
});

// Import Routes
const UserRoute = require("./routes/user.js");
const LoginRoute = require("./routes/login.js");

// Use Routes
app.use("/login", LoginRoute);
app.use("/user", UserRoute);

// Error Handler
app.use(function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err)
  }
});

// Start Server
https.createServer({
  key: fs.readFileSync('./certificates/key.pem'),
  cert: fs.readFileSync('./certificates/cert.pem')
}, app).listen(443);