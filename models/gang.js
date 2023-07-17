const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GangRole = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    permissions: {
        type: [String],
        enum: ["UPDATE_GUILD", "UPLOAD_ICON", "BAN_MEMBERS", "UPDATE_APPLICATIONS", "SEND_MESSAGES", "*"],
        required: true
    },
    hoist: Number
});

const GangMember = new Schema({
    userId: {
        type: String,
        required: true
    },
    roles: {
        type: [GangRole],
        required: true
    }
});

const GangApplication = new Schema({
    userId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

const GangMessage = new Schema({
    id: {
        type: String,
        required: true
    },
    member: {
        type: GangMember,
        required: true
    },
    content: {
        type: String,
        required: true
    }

})

const Gang = mongoose.model("Gang", new Schema({
    id: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    realName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    visible: {
        type: Boolean,
        required: true
    }, // Visible to public through search and featured groups.
    security: {
        type: String,
        required: true,
        enum: ["public", "apply", "invite"]
    },
    owner: {
        type: String,
        required: true
    },
    members: {
        type: [GangMember],
        required: true
    },
    roles: {
        type: [GangRole],
        required: true
    },
    pendingMembers: [GangApplication],
    bannedMembers: [String],
    wall: [GangMessage],
    iconUploaded: {
        type: Boolean,
        required: true
    },
    defaultRole: {
        type: Number,
        required: true
    },
    created: {
        type: Date,
        required: true
    }
}));

module.exports = Gang;