const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const creatorSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
});

module.exports = creatorSchema;