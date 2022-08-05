const mongoose = require("mongoose");

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
        type: Number,
        required: true,
    },
    spawn: require("./coordinates.js"),
    avatarScale: Number,
});

module.exports = worldSettingsSchema;