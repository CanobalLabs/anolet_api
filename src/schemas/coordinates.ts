import mongoose from "mongoose";

export const coordinatesSchema = new mongoose.Schema({
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    }
});