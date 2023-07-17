"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coordinatesSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.coordinatesSchema = new mongoose_1.default.Schema({
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    }
});
