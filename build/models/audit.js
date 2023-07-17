"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audit = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
exports.Audit = mongoose_1.default.model("Audit", new Schema({
    fromUser: {
        type: String,
        required: true
    },
    toObject: {
        type: String,
        required: true
    },
    objectType: {
        type: String,
        required: true,
        enum: ['user', 'group', 'game', 'item', 'website']
    },
    action: {
        type: String,
        required: true,
    },
    at: {
        type: Date,
        required: true,
    },
}));
