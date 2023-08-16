const express = require('express');
let router = express.Router();
const {Gang, resolveGangChildren, saveGangChildren} = require("../models/gang.js");
const GangValidator = require("../validation/gang.js");
const {validate} = require("express-validation");
const minio = require("../modules/Minio.js");
const {v4: uuidv4} = require('uuid');
const CalculatePermissions = require("../modules/CalculatePermissions.js");
const bodyParser = require('body-parser');
const sharp = require("sharp");
const {query} = require("express");

/**
 * Checks if the user has the permission in the gang
 * @param res The response object
 * @param gang The gang object
 * @param permission The permission to check
 * @param againstUser The user to check against (as a GangMember object)
 * @returns {Promise<boolean>} Whether the user has the permission
 */
async function checkGangPerms(res, gang, permission, againstUser = undefined) {
    await resolveGangChildren(gang);
    let member = gang.resolvedMembers.filter(m => m.userId === res.locals.id)[0];
    if (againstUser) {
        let memberMaxRole = 0;
        for (const role in member.roles) {
            if (role.hoist > memberMaxRole) memberMaxRole = role.hoist;
        }

        let victim = gang.resolvedMembers.filter(m => m.userId === againstUser.id)[0];
        let victimMaxRole = 0;

        for (const role in victim.roles) {
            if (role.hoist > victimMaxRole) victimMaxRole = role.hoist;
        }

        if (victimMaxRole > memberMaxRole) return false;
    }
    if (gang.owner === res.locals.id) return true;

    for (const role in member.roles) {
        if (role.permissions.includes(permission || "*")) return true;
    }

    return false;
}

router.get("/s", async (req, res) => {
    const query = {visible: true};
    let page = 0;
    let limit = 20;
    if (req.query.id) query.id = req.query.id;
    if (req.query.realName) query.realName = req.query.realName;
    if (req.query.displayName) query.displayName = req.query.displayName;
    if (req.query.security) query.security = req.query.security;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = Math.min(Math.max(req.query.limit, 1), 200);
    if (!((await CalculatePermissions(res.locals.id)).includes("SEE_HIDDEN_GANGS"))) query.visible = true;

    let gangs = await Gang.find(query, undefined, {skip: limit * page, limit: limit});

    gangs = gangs.map(gang => {
        delete gang._doc.members;
        delete gang._doc.wall;
        delete gang._doc.punishments;
        delete gang._doc.pendingMembers;
        delete gang._doc.wall;
        return gang;
    });

    res.json(gangs);
});

router.post("/", validate(GangValidator.create()), async (req, res) => {
    if (await Gang.findOne({realName: req.body.realName})) return res.status(409).send("Gang with that name already exists");

    let gang = new Gang({
        id: uuidv4(),
        created: new Date(),
        owner: res.locals.id,
        members: [
            {
                userId: res.locals.id,
                roles: [1]
            }
        ],
        roles: [
            {
                id: 0,
                name: "Member",
                permissions: ["SEND_MESSAGES", "VIEW_MESSAGES"],
                hoist: 0
            },
            {
                id: 1,
                name: "Owner",
                permissions: ["*"],
                hoist: 999
            }
        ],
        iconUploaded: false,
        bannerUploaded: false,
        pendingMembers: [],
        punishments: [],
        wall: [],
        visible: req.body.visible ? req.body.visible : true,
        defaultRole: 0,
        ...req.body
    });

    await gang.save();
    res.status(201).json(gang);
});


router.patch("/:gangId", validate(GangValidator.update()), async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    if (!await checkGangPerms(res, gang, "UPDATE_GANG")) return res.status(403).send("You do not have permission to update this gang");

    if (req.body.owner && gang.owner !== res.locals.id) delete req.body.owner;

    if (req.body.realName) {
        Gang.find({realName: req.body.realName}, undefined, {skip: 0, limit: 20}, function (err, results) {
            if (err) return res.status(500).send;
            if (results.length > 0) return res.status(400).send("A guild already exists with that realName");
        });
    }

    if (res.headersSent) return;

    delete req.body.id;
    delete req.body.members;
    delete req.body.pendingMembers;
    delete req.body.punishments;
    delete req.body.wall;
    delete req.body.iconUploaded;

    delete req.body.created;

    await gang.updateOne({
        ...req.body
    });


    res.json(gang);
});

router.delete("/:gangId", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    if (gang.owner !== res.locals.id) return res.status(403);

    await gang.deleteOne();
    res.status(204).send();
});

router.get("/:gangId/icon", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    let url = gang.iconUploaded ? `${process.env.CDN_URL}/gangs/icons/${req.params.gangId}.png` : `${process.env.CDN_URL}/gangs/icons/default.png`;
    res.redirect(url);
});

router.put("/:gangId/icon", bodyParser.raw({inflate: true, limit: "100mb", type: "image/*"}), async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    await checkGangPerms(res, gang, "UPLOAD_ICON");

    let imageData;
    try {
        imageData = await sharp(req.body).resize(512, 512).png().toBuffer();
    } catch (e) {
        return res.status(400).send("Invalid image");
    }

    await minio.removeObject("anolet", `gangs/icons/${req.params.gangId}.png`);
    await minio.putObject("anolet", `gangs/icons/${req.params.gangId}.png`, imageData, "image/png");

    await gang.updateOne({
        iconUploaded: true
    });

    res.status(200).json({iconUploaded: true});
});

router.get("/:gangId/banner", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    let url = gang.bannerUploaded ? `${process.env.CDN_URL}/gangs/banners/${req.params.gangId}.png` : `${process.env.CDN_URL}/gangs/banners/default.png`;
    res.redirect(url);
});

router.put("/:gangId/banner", bodyParser.raw({inflate: true, limit: "100mb", type: "image/*"}), async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    await checkGangPerms(res, gang, "UPLOAD_BANNER");

    let imageData;
    try {
        imageData = await sharp(req.body).resize(1000, 250).png().toBuffer();
    } catch (e) {
        return res.status(400).send("Invalid image");
    }

    await minio.removeObject("anolet", `gangs/banners/${req.params.gangId}.png`);
    await minio.putObject("anolet", `gangs/banners/${req.params.gangId}.png`, imageData, "image/png");

    await gang.updateOne({
        bannerUploaded: true
    });

    res.status(200).json({id: gang.id, bannerUploaded: true});
});

router.post("/:gangId/role", validate(GangValidator.roleCreate()), async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    if (gang.owner !== res.locals.id) return res.status(403);

    let role = {
        id: ++gang.roles.length,
        ...req.body
    }

    gang.roles += role;

    await gang.save();
    res.status(201).json(role);
});

router.patch("/:gangId/role/:roleId", validate(GangValidator.roleUpdate()), async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    if (gang.owner !== res.locals.id) return res.status(403);

    let role = gang.roles.filter((r) => r.id === req.params.roleId)[0];
    role.name = req.body.name;
    role.permissions = req.body.permissions
    role.hoist = req.body.hoist;

    gang.roles.filter((r) => r.id === req.params.roleId).forEach((oldRole) => gang.roles.remove(oldRole));
    gang.roles += role;
    await gang.save();
    res.json(role);
});

router.get("/:gangId/member/s", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    let page = req.query.page ? req.query.page : 0;
    let limit = req.query.limit ? Math.min(Math.max(req.query.limit, 1), 200) : 20;

    let members = gang.members;

    if (req.query.id) {
        return res.json(members.filter(m => m.userId === req.query.id));
    }

    res.json(members.slice(page * limit, page * limit + limit));
});

router.post("/:gangId/member", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    switch (gang.security) {
        case "public":
            break;
        case "apply":
            return res.status(403).send("User must apply to join gang");
        case "invite":
            if (gang.invites.filter(i => i.userId === res.locals.id).length == 0) return res.status(403).send("User is not invited to gang");
            if (gang.invites.filter(i => i.userId === res.locals.id && i.expires < Date.now()).length > 0) return res.status(403).send("User invite has expired");
            gang.invites.filter(i => i.userId === res.locals.id).forEach((invite) => gang.invites.remove(invite));
            break;
        default:
            return res.status(500).send("Gang is malformed");
    }

    if (gang.members.filter(m => res.locals.id === m.userId).length > 0) return res.status(409).send("User is already in gang");
    if (gang.punishments.filter(punishment => (res.locals.id === punishment.userId && punishment.type === "ban" && punishment.expires > Date.now())).length > 0) return res.status(403).send("User is banned from gang");

    let member = {
        userId: res.locals.id,
        roles: [gang.defaultRole]
    };

    gang.members.push(member);
    await gang.save();

    res.json(member);
});

// see member punishments
// router.delete("/:gangId/member", async (req, res) => {
//     const gang = await Gang.findOne({id: req.params.gangId});
//
//     if (!gang) return res.status(404).send("Gang not found");
//     if (gang.security !== "public") return res.status(403).send("Gang is not public");
//
//     if (gang.owner == res.locals.id) return res.status(403).send("Owner cannot leave gang");
//
//     let member = gang.members.filter(m => res.locals.id === m.userId)[0];
//     if (!member) return res.status(409).send("User is not in gang");
//
//     gang.members.remove(member);
//     await gang.save();
//
//     res.status(204).send();
// });

router.delete("/:gangId/member/:userId/kick", validate(GangValidator.memberKick()), async (req, res) => {
    const punishment = {
        id: uuidv4(),
        userId: req.params.userId,
        reason: req.body.reason,
        type: "kick",
        expires: Date.now(),
        issued: Date.now(),
        issuer: req.locals.id
    }

    const gang = await Gang.findOne({id: req.params.gangId});
    if (!gang) return res.status(404).send("Gang not found");

    vic = gang.members.filter((m) => m.userId === req.params.userId)[0];
    if (!checkGangPerms(res, gang, "KICK_MEMBERS", vic)) return res.status(403).send("You cannot kick this member");
    if (vic.roles.includes(gang.owner)) return res.status(403).send("You cannot kick the owner");
    if (vic.userId === req.locals.id) return res.status(403).send("You cannot kick yourself");

    gang.punishments.push(punishment);
    gang.members.remove(vic);
    await gang.save();

    res.status(204).json(punishment);
});

router.delete("/:gangId/member/:userId/ban", validate(GangValidator.memberBan()), async (req, res) => {
    const punishment = {
        id: uuidv4(),
        userId: req.params.userId,
        reason: req.body.reason,
        type: "ban",
        expires: req.body.expires,
        issued: Date.now(),
        issuer: req.locals.id
    }

    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    vic = gang.members.filter((m) => m.userId === req.params.userId)[0];
    if (!checkGangPerms(res, gang, "BAN_MEMBERS", vic)) return res.status(403).send("You cannot ban this member");
    if (vic.roles.includes(gang.owner)) return res.status(403).send("You cannot ban the owner");
    if (vic.userId === req.locals.id) return res.status(403).send("You cannot ban yourself");

    gang.punishments.push(punishment);
    gang.members.remove(vic);
    await gang.save();

    res.status(204).json(punishment);
});

router.post("/:gangId/member/:userId/gameBan", validate(GangValidator.memberGameBan()), async (req, res) => {
    const punishment = {
        id: uuidv4(),
        userId: req.params.userId,
        reason: req.body.reason,
        type: "gameban",
        expires: req.body.expires,
        issued: Date.now(),
        issuer: req.locals.id
    }

    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    vic = gang.members.filter((m) => m.userId === req.params.userId)[0];
    if (!checkGangPerms(res, gang, "GAME_BAN_MEMBERS", vic)) return res.status(403).send("You cannot game ban this member");
    if (vic.roles.includes(gang.owner)) return res.status(403).send("You cannot game ban the owner");
    if (vic.userId === req.locals.id) return res.status(403).send("You cannot game ban yourself");

    gang.punishments.push(punishment);
    await gang.save();

    res.json(punishment);
});

router.post("/:gangId/member/:userId/warn", validate(GangValidator.memberWarn()), async (req, res) => {
    const punishment = {
        id: uuidv4(),
        userId: req.params.userId,
        reason: req.body.reason,
        type: "warn",
        expires: req.body.expires,
        issued: Date.now(),
        issuer: req.locals.id
    }

    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    vic = gang.members.filter((m) => m.userId === req.params.userId)[0];
    if (!checkGangPerms(res, gang, "WARN_MEMBERS", vic)) return res.status(403).send("You cannot warn this member");
    if (vic.roles.includes(gang.owner)) return res.status(403).send("You cannot warn the owner");
    if (vic.userId === req.locals.id) return res.status(403).send("You cannot warn yourself");

    gang.punishments.push(punishment);
    await gang.save();

    res.json(punishment);
});

router.post("/:gangId/member/:userId/mute", validate(GangValidator.memberMute()), async (req, res) => {
    const punishment = {
        id: uuidv4(),
        userId: req.params.userId,
        reason: req.body.reason,
        type: "mute",
        expires: req.body.expires,
        issued: Date.now(),
        issuer: req.locals.id
    }

    let gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    const vic = gang.members.filter((m) => m.userId === req.params.userId)[0];
    if (!await checkGangPerms(res, gang, "MUTE_MEMBERS", vic)) return res.status(403).send("You cannot mute this member");
    if (vic.roles.includes(gang.owner)) return res.status(403).send("You cannot mute the owner");
    if (vic.userId === req.locals.id) return res.status(403).send("You cannot mute yourself");

    gang.punishments.push(punishment);
    await gang.save();

    res.json(punishment);
});

router.post("/:gangId/member/:memberId/role", validate(GangValidator.memberRole()), async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    const vic = gang.members.filter((m) => m.userId === req.params.memberId)[0];
    if (!await checkGangPerms(res, gang, "MANAGE_ROLES", vic)) return res.status(403).send("You cannot manage this member's roles");
    if (vic.roles.includes(gang.owner)) return res.status(403).send("You cannot manage the owner's roles");
    if (vic.userId === req.locals.id) return res.status(403).send("You cannot manage your own roles");

    if (!gang.roles.filter((r) => r.id === req.body.role)) return res.status(404).send("Role not found");

    const member = gang.resolvedMembers.filter((m) => m.userId === res.locals.userId)[0];

    let memberMaxRole = 0;

    for (const role in member.roles) {
        if (role.hoist > memberMaxRole) memberMaxRole = role.hoist;
    }

    if (req.body.role.hoist > memberMaxRole) return res.status(403).send("You cannot give this role to this member");

    gang.members.filter((m) => m.userId === req.body.userId)[0].roles.push(req.body.role);

    await gang.save();

    res.status(204).send();
});

router.delete("/:gangId/member/:memberId/role/:roleId", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    const vic = gang.members.filter((m) => m.userId === req.body.userId)[0];
    if (!await checkGangPerms(res, gang, "MANAGE_ROLES", vic)) return res.status(403).send("You cannot manage this member's roles");
    if (vic.roles.includes(gang.owner)) return res.status(403).send("You cannot manage the owner's roles");
    if (vic.userId === req.locals.id) return res.status(403).send("You cannot manage your own roles");

    gang.members.filter((m) => m.userId === req.body.userId)[0].roles.remove(req.params.roleId);

    await gang.save();

    res.status(204).send();
});

router.post("/:gangId/member/invite/:userId", async (req, res) => {
    // todo notifications

    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    if (!await checkGangPerms(res, gang, "INVITE_USER")) return res.status(403).send("You cannot create invites");

    if (gang.members.filter((m) => m.userId === req.params.userId)[0]) return res.status(403).send("This user is already in the gang");
    if (gang.punishments.filter((p) => p.userId === req.params.userId && p.type === "ban")[0]) return res.status(403).send("This user is banned from the gang");

    const invite = {
        id: uuidv4(),
        userId: req.params.userId,
        issued: Date.now(),
        issuer: req.locals.id
    }

    gang.invites.push(invite);
    await gang.save();

    res.json(invite);
});

router.delete("/:gangId/member/invite/:inviteId", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");
    if (!await checkGangPerms(res, gang, "RESCIND_INVITES")) return res.status(403).send("You cannot delete invites");

    if (!gang.invites.filter((i) => i.id === req.params.inviteId)[0]) return res.status(404).send("Invite not found");

    gang.invites.remove(req.params.inviteId);
    await gang.save();

    res.status(204).send();
});

router.get("/:gangId/application/s", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    let page = req.query.page ? req.query.page : 0;

    let applications = gang.pendingMembers;
    if (req.query.userId) applications = applications.filter((a) => a.userId === req.query.userId);
    res.json(applications.slice(page * 20, page * 20 + 20));
});

router.post("/:gangId/application", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    if (gang.pendingMembers.filter((a) => a.userId === req.locals.id).length > 0) return res.status(409).send("An application has already been sent by this user.");

    let application = {
        userId: res.locals.id,
        content: req.body.content
    };

    gang.pendingMembers.add(application);
    await gang.save();

    res.status(201).json(application);
});

router.post("/:gangId/application/:userId/accept", async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(async gang => {
        if (!gang) return res.status(404).send("Gang not found");

        if (!(await checkGangPerms(res, gang, "UPDATE_APPLICATIONS"))) return;

        if (gang.pendingMembers.filter((a) => a.userId === req.params.userId).length < 1) return res.status(404).send("No application exists with this user.");
        if (gang.punishments.filter(punishment => (res.locals.id === punishment.userId && punishment.type === "ban" && punishment.expires > Date.now())).length > 0) return res.status(403).send("User is banned from gang");

        let member = {
            userId: req.params.userId,
            roles: [gang.defaultRole]
        };
        gang.members.add(member);
        await gang.save();
        res.json(member);
    })
});

router.delete("/:gangId/application/:userId/deny", async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(async gang => {
        if (!gang) return res.status(404).send("Gang not found");

        if (gang.pendingMembers.filter((a) => a.userId === req.params.userId).length < 1) return res.status(404).send("No application exists with this user.");

        gang.pendingMembers.remove({userId: req.params.userId});
        await gang.save();
    })
});

router.get("/:gangId/message/s", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    if (!(await checkGangPerms(res, gang, "VIEW_MESSAGES"))) return res.status(403).send("You cannot view messages in this gang");

    let page = req.query.page ? req.query.page : 0;

    let messages = gang.messages;
    if (req.query.userId) messages = messages.filter((msg) => msg.member.userId === req.query.userId);
    if (req.query.id) messages = messages.filter((msg) => msg.id === req.query.id);
    if (req.query.replyingTo) messages = messages.filter((msg) => msg.replyingTo === req.query.replyingTo);
    if (req.query.content) messages = messages.filter((msg) => msg.content.includes(req.query.content));
    // todo: msg fuzzy search?
    res.json(messages.slice(page * 20, page * 20 + 20));
});

router.post("/:gangId/message", validate(GangValidator.messageCreate()), async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    if (!(await checkGangPerms(res, gang, "SEND_MESSAGES"))) return res.status(403).send("You cannot send messages in this gang");

    let message = {
        id: uuidv4(),
        content: req.body.content,
        member: gang.members.filter((m) => m.userId === req.locals.id)[0],
        sent: Date.now()
    };

    gang.wall.push(message);
    await gang.save();

    res.status(201).json(message);
});

router.post("/:gangId/message/:messageId", validate(GangValidator.messageCreate()), async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    if (!(await checkGangPerms(res, gang, "SEND_MESSAGES"))) return res.status(403).send("You cannot send messages in this gang");

    if (gang.wall.filter((msg) => msg.id === req.params.messageId).length < 1) return res.status(404).send("No message exists with this id");

    let message = {
        id: uuidv4(),
        content: req.body.content,
        member: gang.members.filter((m) => m.userId === req.locals.id)[0],
        replyingTo: req.params.messageId,
        sent: Date.now()
    };

    gang.wall.push(message);
    await gang.save();

    res.status(201).json(message);
});

router.delete("/:gangId/message/:messageId", async (req, res) => {
    const gang = await Gang.findOne({id: req.params.gangId});

    if (!gang) return res.status(404).send("Gang not found");

    const vic = gang.members.filter((m) => m.userId === req.locals.id)[0];

    if (!(await checkGangPerms(res, gang, "DELETE_MESSAGES", vic))) return res.status(403).send("You cannot delete messages in this gang");

    let message = gang.wall.filter((msg) => msg.id === req.params.messageId)[0];
    if (!message) return res.status(404).send("Message not found");

    gang.wall.remove(message);
    await gang.save();
});

module.exports = router;
