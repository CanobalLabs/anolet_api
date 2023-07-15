const express = require('express');
let router = express.Router({ mergeParams: true });

const User = require("../../models/user.js");
const Item = require("../../models/item.js");
const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
var dataUriToBuffer = require('data-uri-to-buffer');
const { validate } = require('express-validation')
const avatarValidation = require("../../validation/avatar.js");
const trimImage = require("trim-image");
const path = require('path');
var minio = require("../../modules/Minio.js");
const fs = require('fs');

router.route("/").post(validate(avatarValidation, {}, {}), async (req, res) => {
    if (!res.locals.id) return res.status(401).send("Unauthorized");

    if (!(req.params.userId == "me" || req.params.userId == res.locals.id) && !(await CalculatePermissions(res.locals.id)).includes("EDIT_AVATARS")) return res.status(403).send("You cannot edit other's avatars.")

    User.findOne({ id: req.params.userId == "me" ? res.locals.id : req.params.userId }).then(usr => {
        // Jumble up all item ids, then make sure the user owns them
        var chosenitems = req.body.accessories.concat(req.body.bodies, req.body.faces, req.body.shoes);
        chosenitems.forEach(async (itm, index) => {
            if (!usr.belongings.includes(itm)) {
                return res.status(400).send("You do not own 1 or more of these items.");
            }
            if ((req.body.bodies[0] == "specialitem-1" || req.body.bodies[0] == "specialitem-2") && (!req.body?.bodyColor || !/^#([0-9a-f]{3}){1,2}$/i.test('#' + req.body.bodyColor))) {
                // Invalid settings for custom body color
                return res.status(400).send("'bodyColor' must be specified and a valid hex when using the specialitem-1/2 body.");
            }
            if (req.body.bodies[0] != "specialitem-1" && req.body.bodies[0] != "specialitem-2" && req.body?.bodyColor) {
                return res.status(400).send("'bodyColor' can only be used with the specialitem-1/2 body.");
            }
            if (req.body.accessories.includes(itm) && (await Item.findOne({ id: itm })).type != "accessory") {
                return res.status(400).send("Invalid item type for accessory slot.");
            }
            if (req.body.bodies.includes(itm) && (await Item.findOne({ id: itm })).type != "body") {
                return res.status(400).send("Invalid item type for body slot.");
            }
            if (req.body.faces.includes(itm) && (await Item.findOne({ id: itm })).type != "face") {
                return res.status(400).send("Invalid item type for face slot.");
            }
            if (req.body.shoes.includes(itm) && (await Item.findOne({ id: itm })).type != "shoes") {
                return res.status(400).send("Invalid item type for shoes slot.");
            }
            if (index + 1 == chosenitems.length) {
                res.setHeader("content-type", "image/png");
                // all good, let's set their avatar...
                User.updateOne({ id: req.params.userId == "me" ? res.locals.id : req.params.userId }, {
                    $set: {
                        avatar: {
                            accessories: req.body.accessories,
                            bodies: req.body.bodies,
                            shoes: req.body.shoes,
                            faces: req.body.faces
                        },
                        bodyColor: req.body?.bodyColor || undefined,
                    },
                    $unset: {
                        defaultRender: undefined
                    }
                }).then(() => {
                    var cdn = "https://cdn.anolet.com"
                    // and now render it...
                    console.log("rendering")
                    mergeImages([
                        req.body?.bodyColor ? `https://api-staging.anolet.com/asset/${req.body.bodies[0]}/${req.body.bodyColor}` : `${cdn}/items/${req.body.bodies[0]}/internal.png`,
                        { src: `${cdn}/items/${req.body.faces[0]}/internal.png`, y: req.body.faceOffset || 20 },
                        req.body.shoes[0] ? `${cdn}/items/${req.body.shoes[0]}/internal.png` : `${cdn}/templates/blank.png`,
                        req.body.accessories[0] ? `${cdn}/items/${req.body.accessories[0]}/internal.png` : `${cdn}/templates/blank.png`,
                        req.body.accessories[1] ? `${cdn}/items/${req.body.accessories[1]}/internal.png` : `${cdn}/templates/blank.png`,
                        req.body.accessories[2] ? `${cdn}/items/${req.body.accessories[2]}/internal.png` : `${cdn}/templates/blank.png`,
                    ], {
                        Canvas: Canvas,
                        Image: Image
                    })
                        .then(b64 => {
                            console.log("rendered")
                            var calculatedAvatarBuffer = dataUriToBuffer(b64)
                            minio.putObject('anolet', `avatars/${req.params.userId == "me" ? res.locals.id : req.params.userId}/internal.png`, calculatedAvatarBuffer, function (err, etag) {
                                let fileName = path.join(__dirname, '../tmp') + "/" + (req.params.userId == "me" ? res.locals.id : req.params.userId) + ".png";
                                let trimName = path.join(__dirname, '../tmp') + "/trim-" + (req.params.userId == "me" ? res.locals.id : req.params.userId) + ".png"


                                // Generate Preview
                                fs.writeFile(fileName, calculatedAvatarBuffer, function (err) {
                                    trimImage(fileName, trimName, undefined, function (err) {
                                        console.log(err);

                                        // We have to wait a bit for the file to be written. For some reason the callback is called before file writing is complete, so this is a ducktape solution for now.
                                        setTimeout(function () {
                                            fs.readFile(trimName, function (err, data) {
                                                minio.putObject('anolet', `avatars/${req.params.userId == "me" ? res.locals.id : req.params.userId}/preview.png`, data, function (err, etag) {
                                                    console.log(err);
                                                    fs.unlink(fileName, (err) => { if (err) throw err });
                                                    fs.unlink(trimName, (err) => { if (err) throw err });
                                                    res.send(calculatedAvatarBuffer);
                                                });
                                            });
                                        }, 3000);
                                    });
                                });
                            });
                        });
                }).catch(error => console.log(error))
            }
        });
    });
})

router.route("/:type").get((req, res) => {
    if (req.params.type != "internal" && req.params.type != "preview") return res.status(400).send("Invalid type");
    if (req.params.userId.split("_")[0] == "player") return res.redirect("https://cdn.anolet.com/avatars/anolet/" + req.params.type + ".png")
    User.findOne({ "id": req.params.userId }, "defaultRender").then(user => {
        if (user == null) return res.status(404).send()
        if (user?.defaultRender) {
            res.redirect("https://cdn.anolet.com/avatars/" + req.params.userId + "/" + req.params.type + ".png");
        } else {
            res.redirect("https://cdn.anolet.com/avatars/anolet/" + req.params.type + ".png");
        }
    });
});

module.exports = router
