const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model("User", new Schema({
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
    ranks: [String],
    suspensions: [require("../schemas/suspension")]
}));
