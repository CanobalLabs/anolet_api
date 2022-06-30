const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    rank: {
        type: String,
        required: false,
    },
    amulets: {
        type: Number,
        required: true,
    },
    about: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false
    },
    emailVerified: {
        type: Boolean,
        required: false
    },
});

const User = mongoose.model("User", userSchema);
module.exports = User;