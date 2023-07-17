"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worldSettingsSchema = void 0;
const mongoose = require("mongoose");
exports.worldSettingsSchema = new mongoose.Schema({
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
