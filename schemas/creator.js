const mongoose = require("mongoose");

const creatorSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
});

module.exports = creatorSchema;