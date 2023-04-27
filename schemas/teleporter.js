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
    area: [[Number,Number]]
});

module.exports = teleporterSchema;
