const express = require('express');
let router = express.Router();
const Gang= require("../models/gang.js");
const GangValidator = require("../validation/gang.js");
const { validate } = require("express-validation");
const minio = require("../modules/Minio.js");
const { v4: uuidv4 } = require('uuid');
const CalculatePermissions = require("../modules/CalculatePermissions.js");
const bodyParser = require('body-parser');
const sharp = require("sharp");

function checkGangPerms(res, gang, permission) {
    let hasPerms = gang.owner === res.locals.id;
    let member = gang.members.filter((m) => m.userId === res.locals.id)[0];
    member.roles.forEach((role) => {
        if (role.permissions.includes(permission || "*")) {
            hasPerms = true;
        }
    });

    if (!hasPerms) return res.status(403).send("You do not have the permission " + permission);
}

router.get("/s", async (req, res) => {
    const query= {visible: true};
    let page = 0;
    if (req.query.id) query.id = req.query.id;
    if (req.query.realName) query.realName = req.query.realName;
    if (req.query.displayName) query.displayName = req.query.displayName;
    if (req.query.page) page = req.query.page;
    if ((await CalculatePermissions(res.locals.id)).includes("SEE_HIDDEN_GANGS")) delete query.visible;

    Gang.find(query, undefined, { skip: 20 * page, limit: 20}, function (err, results) {
        if (err) throw err;
        results.forEach(gang => {
            delete gang.members;
            delete gang.pendingMembers;
            delete gang.bannedMembers;
            delete gang.wall;
        });

        res.json(results);
    });
});

router.post("/", validate(GangValidator.create()), async (req, res) => {
    Gang.find({ realName: req.body.realName }, undefined, {skip: 0, limit: 20}, function(err, results) {
        if (err) return res.status(500).send;
        if (results.length > 0) return res.status(400).send("A guild already exists with that realName");
    });

    let gang = new Gang({
        id: uuidv4(),
        created: new Date(),
        owner: res.locals.id,
        members: [
            {
                userId: res.locals.id,
                roles: [{
                    id: 1,
                    name: "Owner",
                    permissions: ["*"],
                    hoist: 999
                }]
            }
        ],
        roles: [
            {
                id: 1,
                name: "Owner",
                permissions: ["*"],
                hoist: 999
            },
            {
                id: 0,
                name: "Member",
                permissions: ["SEND_MESSAGES"],
                hoist: 0
            }
        ],
        iconUploaded: false,
        visible: req.body.visible? req.body.visible : true,
        defaultRole: 0,
        ... req.body
    });

    await gang.save();
    res.status(201).json(gang);
});

router.get("/:gangId/icon", bodyParser({ inflate: true, limit: "100mb", type: "image/png" }), async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(async (gang) => {
        if (!gang) return res.status(404).send("Gang not found");

        let url = gang.iconUploaded ? `${process.env.CDN_URL}/gangs/icons/${req.params.gangId}.png` : `${process.env.CDN_URL}/gangs/icons/default.png`;
        res.redirect(url);
    });
});

router.put("/:gangId/icon", bodyParser.raw({ inflate: true, limit: "100mb", type: "image/*" }), async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(async (gang) => {
        if (!gang) return res.status(404).send("Gang not found");

        checkGangPerms(res, gang, "UPDATE_ICON")

        await sharp(req.body).resize(512, 512).png().toBuffer().then(async (imageData) => {
            await minio.removeObject("anolet", `gangs/icons/${req.params.gangId}.png`).catch(() => { return res.status(500).send("Internal server error."); });
            await minio.putObject("anolet", `gangs/icons/${req.params.gangId}.png`, imageData, "image/png").then(async () => {
                await gang.updateOne({
                    iconUploaded: true
                }).then(() => {
                    res.status(200).json({iconUploaded: true});
                });
            }).catch(() => { return res.status(500).send("Internal server error."); });
        }).catch(() => { return res.status(500).send("Internal server error."); });
    });
});

router.patch("/:gangId", validate(GangValidator.update()), async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(async (gang) => {
        if (!gang) return res.status(404).send("Gang not found");

        checkGangPerms(res, gang, "UPDATE_GANG");

        if (req.body.owner && gang.owner !== res.locals.id) delete req.body.owner;

        if (req.body.realName) {
            Gang.find({realName: req.body.realName}, undefined, {skip: 0, limit: 20}, function (err, results) {
                if (err) return res.status(500).send;
                if (results.length > 0) return res.status(400).send("A guild already exists with that realName");
            });
        }

        delete req.body.id;
        delete req.body.members;
        delete req.body.pendingMembers;
        delete req.body.bannedMembers;
        delete req.body.wall;
        delete req.body.iconUploaded;

        delete req.body.created;

        await gang.updateOne({
            ...req.body
        });
        res.json(gang);
    });
});

router.post("/:gangId/role", validate(GangValidator.roleCreate()), async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(gang => {
        if (!gang) return res.status(404).send("Gang not found");
        if (gang.owner !== res.locals.id) return res.status(403);

        let role = {
            id: ++gang.roles.length,
            ... req.body
        }

        gang.roles += role;

        gang.save();
        res.status(201).json(role);
    });
});

router.patch("/:gangId/role/:roleId", validate(GangValidator.roleUpdate()), async (req, res) => {
    Gang.findOne({id: req.params.gangId}.then(gang => {
        if (!gang) return res.status(404).send("Gang not found");
        if (gang.owner !== res.locals.id) return res.status(403);

        let role = gang.roles.filter((r) => r.id === req.params.roleId)[0];
        role.name = req.body.name;
        role.permissions = req.body.permissions
        role.hoist = req.body.hoist;

        gang.roles.filter((r) => r.id === req.params.roleId).forEach((oldRole) => gang.roles.remove(oldRole));
        gang.roles += role;
        gang.save();
        req.json(role);
    }));
});

router.get("/:gangId/member/s", async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(gang => {
        if (!gang) return res.status(404).send("Gang not found");

        let page = req.query.page? req.query.page : 0;

        let members = gang.members;
        if (req.query.userId) members = members.filter((m) => m.userId === req.query.userId);
        res.json(members.slice(page * 20, page * 20 + 20));
    });
});

router.post("/:gangId/member", async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(async gang => {
        if (!gang) return res.status(404).send("Gang not found");

        if (gang.security !== "public") return res.status(403).send("Gang is not public");


        let member = {
            userId: res.locals.id,
            roles: [gang.defaultRole]
        };

        gang.members.add(member);
        await gang.save();

        res.json(member);
    });
});



router.get("/:gangId/application/s", async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(gang => {
        if (!gang) return res.status(404).send("Gang not found");

        let page = req.query.page? req.query.page : 0;

        let applications = gang.pendingMembers;
        if (req.query.userId) applications = applications.filter((a) => a.userId === req.query.userId);
        res.json(applications.slice(page * 20, page * 20 + 20));
    })
});

router.post("/:gangId/application", async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(async gang => {
        if (!gang) return res.status(404).send("Gang not found");

        if (gang.pendingMembers.filter((a) => a.userId === req.locals.id).length > 0) return res.status(409).send("An application has already been sent by this user.");

        let application = {
            userId: res.locals.id,
            content: req.body.content
        };

        gang.pendingMembers.add(application);
        await gang.save();

        res.status(201).json(application);
    })
});

router.post("/:gangId/application/:userId/accept", async (req, res) => {
    Gang.findOne({id: req.params.gangId}).then(async gang => {
        if (!gang) return res.status(404).send("Gang not found");
        checkGangPerms(res, gang, "UPDATE_APPLICATIONS");

        if (gang.pendingMembers.filter((a) => a.userId === req.params.userId).length < 1) return res.status(404).send("No application exists with this user.");

        let member = {
            userId: req.params.userId,
            roles: [gang.defaultRole]
        };

        gang.members.add(member);
        await gang.save()
        res.json(member)
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

module.exports = router;