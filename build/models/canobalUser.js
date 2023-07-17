"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanobalUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const modelSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        required: true
    },
    authType: {
        type: String,
        required: true,
        enum: ["email", "phone"]
    },
    auth: {
        type: String,
        required: true,
    },
    authVerified: {
        type: Boolean,
        default: false
    },
    registeredVendors: [{
            type: String,
            enum: ["anolet", "question_house"],
            default: []
        }],
    lastLogin: {
        type: Date,
        default: null
    },
    loginCode: {
        type: Number,
        default: ""
    },
    loginVendor: {
        type: String,
        enum: ["anolet", "question_house", ""],
        default: ""
    },
    pfp: {
        type: String,
        default: "default"
    },
    username: {
        type: String,
        default: null
    },
    gems: {
        type: Number,
        default: 500
    },
    about: {
        type: String,
        default: ""
    },
});
modelSchema.index({ username: 'text' });
exports.CanobalUser = mongoose_1.default.model("CanobalUser", modelSchema);
