const mongoose = require("mongoose");

const belongingsSchema = new mongoose.Schema({
    accessories: [String],
    faces: [String],
    bodies: [String],
    shoes: [String],
    bodyColor: String || undefined
});

module.exports = belongingsSchema;
