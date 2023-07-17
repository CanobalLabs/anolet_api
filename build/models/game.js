"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const gameSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    maxMaxPlayers: {
        type: Number,
        required: true,
    },
    maxPlayers: {
        type: Number,
        required: true,
    },
    privacyLevel: {
        type: Number,
        required: true,
    },
    suspended: {
        type: Boolean,
        required: true,
    },
    suspendedReason: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: true,
    },
    visits: {
        type: Number,
        required: true,
    },
    created: {
        type: Date,
        required: true,
    },
    lastUpdated: {
        type: Date,
        required: true,
    },
    iconAssetURL: {
        type: String,
        required: true,
    },
    carouselImages: [String],
    playing: {
        type: Number,
        required: true,
    },
    playingP: Number,
    gdp: Number,
    totalHoursPlayed: {
        type: Number,
        required: true,
    },
    totalUpdates: {
        type: Number,
        required: true,
    },
    creator: require("../schemas/creator"),
    worldSettings: require("../schemas/worldSettings"),
    zones: [{
            id: String,
            nickname: String,
            boundaryPolylines: [[[Number]]],
            boundaries: [require("../schemas/boundary")],
            teleporters: [require("../schemas/teleporter")],
            spawn: [Number, Number],
            layers: [{
                    layer: String,
                    nickname: String,
                    assetURL: String
                }]
        }],
});
gameSchema.index({ title: 'text' });
exports.Game = mongoose_1.default.model("Game", gameSchema);
