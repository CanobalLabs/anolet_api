const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    manager: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    assetURL: String,
    previewURL: String,
    price: {
        type: Number,
        required: true,
    },
    saleEnd: {
        type: Date,
        required: true,
    },
    created: {
        type: Date,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
});

itemSchema.index({name: 'text', owner: 'text', description: 'text'});
const Item = mongoose.model("Item", itemSchema);
module.exports = Item;