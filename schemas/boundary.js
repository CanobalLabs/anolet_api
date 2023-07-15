const mongoose = require("mongoose");

module.exports = new mongoose.Schema({
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
