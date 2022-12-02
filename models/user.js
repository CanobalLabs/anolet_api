const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    belongings: [String],
    avatar: require("../schemas/belongings"),
    defaultRender: {
        type: Boolean,
        required: true
    },
    created: {
        type: Date,
        required: true
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    ranks: [String],
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
    suspensions: [require("../schemas/belongings")]
});

userSchema.index({username: 'text'});
const User = mongoose.model("User", userSchema);
module.exports = User;
