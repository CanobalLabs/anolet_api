import mongoose from "mongoose";

const Schema = mongoose.Schema;

export const User = mongoose.model("User", new Schema({
    id: {
        type: String,
        required: true,
    },
    belongings: [String],
    avatar: require("../schemas/belongings"),
    defaultRender: Number,
    ranks: [String],
    suspensions: [require("../schemas/suspension")]
}));
