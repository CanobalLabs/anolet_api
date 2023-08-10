const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const modelSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        required: true
    },
    authType: {
        type: String,
        required: true,
        enum: ["email", "phone"]
    },
    auth: {
        type: String,
        required: true,
    },
    authVerified: {
        type: Boolean,
        default: false
    },
    registeredVendors: [{
        type: String,
        enum: ["anolet", "question_house"],
        default: []
    }],
    lastLogin: {
        type: Date,
        default: null
    },
    loginCode: {
        type: Number,
        default: ""
    },
    loginVendor: {
        type: String,
        enum: ["anolet", "question_house", ""],
        default: ""
    },
  
  
    pfp: {
        type: String,
        default: "default"
    },
    username: {
        type: String,
        default: null
    },
    displayName: {
        type: String,
        required: true
    },
    gems: {
        type: Number,
        default: 500
    },
    about: {
        type: String,
        default: ""
    },
});

modelSchema.index({username: 'text'});
module.exports = mongoose.model("CanobalUser", modelSchema);
