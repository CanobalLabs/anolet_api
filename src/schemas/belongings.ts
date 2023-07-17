import mongoose from "mongoose";

export const belongingsSchema = new mongoose.Schema({
    accessories: [String],
    faces: [String],
    bodies: [String],
    shoes: [String],
    bodyColor: String || undefined
});
