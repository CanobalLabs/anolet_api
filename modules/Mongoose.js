const mongoose = require("mongoose");
require('dotenv').config();
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true })
    .then(result =>
        console.log("Connected to DB")).catch(err => console.log(err));
module.exports = mongoose