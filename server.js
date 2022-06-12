const express = require("express");
const { ValidationError } = require('express-validation')
const app = express();
const cors = require('cors');
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

var whitelist = ['https://alpha.anolet.com', 'https://anolet.com', 'http://localhost', "https://localhost", "https://localhost:3000", "http://localhost:3000", "https://api.anolet.com"]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions));
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
app.listen(process.env.PORT || 80, () => {
  console.log("Server Started");
});