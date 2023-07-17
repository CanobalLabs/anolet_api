"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.boundarySchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.boundarySchema = new mongoose_1.default.Schema({
    id: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    barrier: Boolean,
    region: [[Number, Number]]
});
