const mongoose = require("mongoose");

const coordinatesSchema = mongoose.Schema({
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