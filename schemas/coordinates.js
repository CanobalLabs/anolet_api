const mongoose = require("mongoose");

const coordinatesSchema = new mongoose.Schema({
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    }
});

module.exports = coordinatesSchema;