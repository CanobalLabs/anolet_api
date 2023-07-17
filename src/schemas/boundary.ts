import mongoose from "mongoose";

export const boundarySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    barrier: Boolean,
    region: [[Number,Number]]
});
