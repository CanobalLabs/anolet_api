"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoose = void 0;
exports.mongoose = require("mongoose");
require('dotenv').config();
exports.mongoose.connect(process.env.DB_URI, { useNewUrlParser: true }).then(result => {
    console.log("Database connection established");
}).catch(err => console.log(err));
