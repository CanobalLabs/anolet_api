const mongoose = require("mongoose");

const teleporterSchema = mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    toZone: {
        type: String,
        required: true,
    },
    region: [[Number,Number]]
});

module.exports = teleporterSchema;
