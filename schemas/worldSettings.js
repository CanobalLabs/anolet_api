const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const worldSettingsSchema = mongoose.Schema({
    movementType: {
        type: String,
        required: true,
    },
    defaultSpeed: {
        type: Number,
        required: true,
    },
    defaultZone: {
        type: String,
        required: true,
    },
    avatarScale: Number,
});

module.exports = worldSettingsSchema;