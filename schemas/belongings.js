const mongoose = require("mongoose");

const belongingsSchema = mongoose.Schema({
    hats: [String],
    faces: [String],
    bodies: [String],
    shoes: [String]
});

module.exports = belongingsSchema;