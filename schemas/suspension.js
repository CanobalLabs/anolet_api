const mongoose = require("mongoose");

const suspensionSchema = mongoose.Schema({
    id: String,
    source: String, // link
    sourceName: String, // type of offending material, eg: "Chat Message", "Profile Picture", "User Description" etc etc
    sourceContent: String, // offending material, eg: "I hate bald people", ""
    sourceContentType: {
        type: String,
        // Make changes to validation/user/suspension.js@L10 also
        enum: ["profile_username", "chat_message", "game_metadata", "game_content", "group", "profile_description", "profile_picture", "other"]
    },
    reason: String,
    suspensionStart: Date,
    suspensionEnd: Date,
    internalNote: String,
    suspendedBy: String,
    usernameChange: Boolean // Ban can be resolved if the user changes their username
});

module.exports = suspensionSchema;