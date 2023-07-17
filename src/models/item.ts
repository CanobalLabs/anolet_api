import mongoose from "mongoose";

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
    assetUploaded: {
        type: Boolean,
        required: true
    },
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
    sales: {
        type: Number,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
});

itemSchema.index({name: 'text', description: 'text'});
export const Item = mongoose.model("Item", itemSchema);