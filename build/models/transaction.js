"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const transactionSchema = new Schema({
    asset: String,
    assetType: String,
    status: {
        type: String,
        enum: [
            'success',
            'refunded'
        ],
        default: 'success'
    },
    date: Date,
    gems: Number,
    increaseParty: String,
    decreaseParty: String
});
exports.Transaction = mongoose_1.default.model("Transaction", transactionSchema);
