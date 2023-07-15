const mongoose = require("mongoose");

const worldSettingsSchema = new mongoose.Schema({
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