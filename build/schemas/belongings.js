"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.belongingsSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.belongingsSchema = new mongoose_1.default.Schema({
    accessories: [String],
    faces: [String],
    bodies: [String],
    shoes: [String],
    bodyColor: String || undefined
});
