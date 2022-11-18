const mongoose = require("mongoose");

const belongingsSchema = mongoose.Schema({
    accessories: [String],
    faces: [String],
    bodies: [String],
    shoes: [String],
    bodyColor: String
});

module.exports = belongingsSchema;
