const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GangMember = new Schema({
    userId: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
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
    replyingTo: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    }
})

const GangPunishment = new Schema({
    id: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["ban", "gameban", "mute", "warn", "kick"],
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    issued: {
        type: Date,
        required: true
    },
    actor: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
})

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
        enum: ["UPDATE_GUILD", "UPLOAD_ICON", "UPLOAD_BANNER", "BAN_MEMBERS", "KICK_MEMBERS", "MUTE_MEMBERS", "WARN_MEMBERS", "GAME_BAN_MEMBERS", "UPDATE_APPLICATIONS", "SEND_MESSAGES", "*"],
        required: true
    },
    hoist: Number
});

const GangInvite = new Schema({
    id: {
        type: String,
        required: true
    },
    invitedUser: {
        type: String,
        required: true
    },
    actor: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
});

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
    pendingMembers: {
        type: [GangApplication],
        required: true
    },
    punishments: {
        type: [GangPunishment],
        required: true
    },
    wall: {
        type: [GangMessage],
        required: true
    },
    invites: {
        type: [GangInvite],
        required: true
    },
    iconUploaded: {
        type: Boolean,
        required: true
    },
    bannerUploaded: {
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

async function resolveGangChildren(gang) {
    gang.resolvedMembers = gang.members.map(member => {
        member.roles = member.roles.map(role => {
            role = gang.roles.forEach(r => {
                gang.roles.find(r => r.id === role);
            });
        });
        return member;
    });
}

module.exports = {
    Gang,
    GangRole,
    resolveGangChildren,
    GangMember,
    GangApplication,
    GangMessage
}
