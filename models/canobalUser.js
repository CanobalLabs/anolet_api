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
    authVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    registeredPlatforms: {
        type: String,
        required: true,
        enum: ["anolet", "questionhouse"]
    },
    lastLogin: Date,
  
  
    pfp: String,
    username: String,
    gems: {
        type: Number,
        required: true,
        default: 0
    },
    about: String,
});

modelSchema.index({username: 'text'});
module.exports = mongoose.model("CanobalUser", modelSchema);;
