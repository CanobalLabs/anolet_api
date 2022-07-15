const mongoose = require("mongoose");
require('dotenv').config();
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true }).then(result => {
    console.log("Database connection established");
}).catch(err => console.log(err));
module.exports = mongoose