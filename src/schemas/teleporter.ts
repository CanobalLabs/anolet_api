import mongoose from "mongoose";

export const teleporterSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    toZone: {
        type: String,
        required: true,
    },
    region: [[Number,Number]]
});
