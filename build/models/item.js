"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    manager: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    assetUploaded: {
        type: Boolean,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    saleEnd: {
        type: Date,
        required: true,
    },
    created: {
        type: Date,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean,
        required: true,
    },
    sales: {
        type: Number,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
});
itemSchema.index({ name: 'text', description: 'text' });
exports.Item = mongoose_1.default.model("Item", itemSchema);
