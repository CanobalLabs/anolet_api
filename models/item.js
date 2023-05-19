const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    id: {
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
    created: {
        type: Date,
        required: true
    },

    name: {
        type: String,
        default: "Untitled Item",
    },
    description: String,
    type: {
        type: String,
        enum: ["accessory", "body", "face", "shoes"]
    },
    purchaseType: {
        type: String,
        enum: ["seperate", "included"],  // seperate: you must buy each variant seperately (different variants can have different prices), included: you buy the item for one price and get all variants 
    },
    price: Number, // only if purchaseType = included
    variants: [{
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            default: "Untitled Variant"
        },
        color: String,
        price: Number, // only if purchaseType = seperate
        assetUploaded: {
            type: Boolean,
            default: false
        }
    }],
    sales: [{
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            default: "Untitled Sale"
        },
        description: String,
        begin: Date,
        end: Date,
        variants: [{
            variant: {
                type: String,
                required: true,
            },
            discount: { // percentage
                type: Number,
                default: 0
            },
        }]
    }],
    releaseDate: {
        type: Date,
        required: true,
    },
    sales: {
        type: Number,
        required: true,
    },
});

itemSchema.index({name: 'text', description: 'text'});
const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
