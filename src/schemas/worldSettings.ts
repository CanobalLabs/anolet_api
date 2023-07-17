const mongoose = require("mongoose");

export const worldSettingsSchema = new mongoose.Schema({
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