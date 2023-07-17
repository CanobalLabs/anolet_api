"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suspensionSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.suspensionSchema = new mongoose_1.default.Schema({
    id: String,
    source: String,
    sourceName: String,
    sourceContent: String,
    sourceContentType: {
        type: String,
        // Make changes to validation/user/suspension.js@L10 also
        enum: ["profile_username", "chat_message", "game_metadata", "game_content", "group", "profile_description", "profile_picture", "other"]
    },
    reason: String,
    suspensionStart: Date,
    suspensionEnd: Date,
    internalNote: String,
    suspendedBy: String,
    usernameChange: Boolean // Ban can be resolved if the user changes their username
});
