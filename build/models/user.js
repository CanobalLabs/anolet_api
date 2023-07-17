"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
exports.User = mongoose_1.default.model("User", new Schema({
    id: {
        type: String,
        required: true,
    },
    belongings: [String],
    avatar: require("../schemas/belongings"),
    defaultRender: Number,
    ranks: [String],
    suspensions: [require("../schemas/suspension")]
}));
