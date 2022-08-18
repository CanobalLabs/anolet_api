const express = require('express');
let router = express.Router();
const User = require("../models/user.js");
const { validate } = require('express-validation')
const validation = require("../validation/user/edit.js");
const avatarValidation = require("../validation/avatar.js");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.MAIL);
const jwt = require('jsonwebtoken');
const fs = require("fs");
const bcrypt = require('bcrypt');
var minio = require("../modules/Minio.js");

const endpoints = {
    "site": "https://staging.anolet.com",
    "email-verify": (process.env.ENVIRONMENT == "dev") ? "http://localhost/user/verify/" : "https://staging-api-infra.anolet.com/user/verify/",
    "password-reset": (process.env.ENVIRONMENT == "dev") ? "http://localhost/user/verify/" : "https://staging-api-infra.anolet.com/user/verify/",
}
router.route("/me").get((req, res) => {
    if (!res.locals.id) return res.send("Unauthorized");
    User.findOne({ id: res.locals.id }).then(user => {
        user.password = undefined;
        res.json(user);
    });
}).post(validate(validation, {}, {}), async (req, res) => {
    if (!res.locals.id) return req.status(401).send("Unauthorized");
    if (req.body.username && /^[a-zA-Z0-9_.-]*$/.test(req.body.username) == false) return req.status(400).send("Bad UN")
    if (req.body.username) {
        // Check Username Exist
        User.findOne({ "username": req.body.username }).then(ue => {
            if (ue !== null && ue.id != res.locals.id) return req.status(400).send("Username is taken")
        });
    }
    User.findOneAndUpdate(
        {
            "id": res.locals.id
        },
        {
            username: req.body.username,
            about: req.body.about
        }, { new: true }
    ).then(response => {
        response.password = undefined;
        res.json(response);
    }).catch(err => res.send(err))
});

router.route("/me/email").post(async (req, res) => {
    if (!res.locals.id) return req.status(401).send("Unauthorized");
    if (req.body?.email === undefined || req.body.email.length > 50) return res.status(400).send("Email is invalid");
    User.updateOne(
        {
            "id": res.locals.id
        },
        {
            email: req.body.email,
            emailVerified: false
        }, { new: true }
    ).then(response => {
        sgMail
            .send({
                to: req.body.email,
                from: {
                    email: 'noreply@anolet.com',
                    name: 'Anolet Support'
                },
                subject: 'Anolet Email Verification',
                text: 'This email has been linked to an Anolet account.',
                html: fs.readFileSync('./mail/verify.html', 'utf8').replace("${href}", endpoints["email-verify"] + jwt.sign({ id: res.locals.id, email: req.body.email }, process.env.HASH)),
            })
            .then(() => {
                res.send("Email sent");
            })
            .catch((error) => {
                res.send(error);
            })
    }).catch(err => res.send(err))
});

router.route("/me/send-reset-email").post(async (req, res) => {
    if (!res.locals.id) return req.status(401).send("Unauthorized");
    // make this prettier soon
    User.findOne(
        {
            "id": res.locals.id
        }, "email emailVerified"
    ).then(response => {
        if (response.emailVerified) {
            sgMail.send({
                to: response.email,
                from: {
                    email: 'noreply@anolet.com',
                    name: 'Anolet Support'
                },
                subject: 'Anolet Password Reset',
                text: "A password reset has been requested for the Anolet account linked to this email.",
                html: `<a>A password reset has been requested for the Anolet account linked to this email.</a><br><br><b>Please click <a href="${endpoints['password-reset']}${jwt.sign({ id: res.locals.id, "type": "password_reset" }, process.env.HASH, { expiresIn: "1h" })}">here</a> to reset your password. This link will expire in 1 hour.</b><br><br><small>If you didn't request this email, you can ignore it. This email is not monitored, and responses will not be received.</small>`,
            }).then(() => {
                res.send("Email sent");
            }).catch((error) => {
                res.error(error);
            });
        } else {
            return res.status(400).send("Email not verified");
        }
    })
});

router.route("/me/change-password").post(async (req, res) => {
    if (!res.locals.id) return req.status(401).send("Unauthorized");
    if (req.body?.token == undefined) return res.status(400).send("Token is invalid");
    if (req.body?.password === undefined || req.body.password.length < 8) return res.status(400).send("Password is invalid");
    jwt.verify(req.body.token, process.env.HASH, (err, decoded) => {
        if (err) return res.status(400).send("Token is invalid");
        if (decoded.type != "password_reset") return res.status(400).send("Token is invalid");
        bcrypt.hash(req.body.password, 10, function (err, hash) {
            if (err) return res.send(err);
            User.findOneAndUpdate(
                {
                    "id": decoded.id
                },
                {
                    password: hash
                }, { new: true }
            ).then(response => {
                res.json("Password changed");
            }).catch(err => res.send(err));
        });
    });
});

router.route("/verify/:jwt").get(async (req, res) => {
    if (req.params.jwt === undefined) return res.status(400).send("Invalid Token");
    jwt.verify(req.params.jwt, process.env.HASH, function (err, decoded) {
        if (err) return res.status(400).send("Invalid Token");
        User.findOne({ id: decoded.id }).then(user => {
            if (user.email !== decoded.email) return res.status(400).send("Invalid Token");
            User.findOneAndUpdate(
                {
                    "id": decoded.id
                },
                {
                    emailVerified: true
                }, { new: true }
            ).then(response => {
                res.send(`<h1>Email Verified</h1><br><a href="${endpoints.site}">Return to website</a>`);
            });
        });
    });
});

const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
var dataUriToBuffer = require('data-uri-to-buffer');
router.route("/me/avatar").post(validate(avatarValidation, {}, {}), (req, res) => {
    if (!res.locals.id) return res.status(401).send("Unauthorized");
    User.findOne({ id: res.locals.id }).then(usr => {
        // Jumble up all item ids, then make sure the user owns them
        var owneditems = usr.belongings.hats.concat(usr.belongings.bodies, usr.belongings.faces, usr.belongings.shoes)
        var chosenitems = req.body.hats.concat(req.body.bodies, req.body.faces, req.body.shoes)
        chosenitems.forEach((item, index) => {
            if (!owneditems.includes(item)) {
                return res.status(400).send("You do not own 1 or more of these items.");
            }
            if (index + 1 == chosenitems.length) {
                res.setHeader("content-type", "image/png");
                // all good, let's set their avatar...
                User.findOneAndUpdate({ id: res.locals.id }, {
                    avatar: {
                        hats: req.body.hats,
                        bodies: req.body.bodies,
                        shoes: req.body.shoes,
                        faces: req.body.faces
                    },
                    defaultRender: false
                });

                var cdn = "https://cdn.anolet.com"
                // and now render it...
                mergeImages([
                    `${cdn}/items/${req.body.bodies[0]}/internal.png`,
                    { src: `${cdn}/items/${req.body.faces[0]}/internal.png`, y: 20 },
                    req.body.shoes[0] ? `${cdn}/items/${req.body.shoes[0]}/internal.png` : `${cdn}/templates/blank.png`,
                    req.body.hats[0] ? `${cdn}/items/${req.body.hats[0]}/internal.png` : `${cdn}/templates/blank.png`,
                    req.body.hats[1] ? `${cdn}/items/${req.body.hats[1]}/internal.png` : `${cdn}/templates/blank.png`,
                    req.body.hats[2] ? `${cdn}/items/${req.body.hats[2]}/internal.png` : `${cdn}/templates/blank.png`,
                ], {
                    Canvas: Canvas,
                    Image: Image
                })
                    .then(b64 => {
                        var calculatedAvatarBuffer = dataUriToBuffer(b64)
                        minio.putObject('anolet', `avatars/${res.locals.id}/internal.png`, calculatedAvatarBuffer, function (err, etag) {
                            res.send(calculatedAvatarBuffer);
                        });
                    });
            }
        });
    });
})

router.route("/:userId").get((req, res) => {
    User.findOne({ "id": req.params.userId }, "username about rank belongings avatar created defaultRender ranks").then(user => {
        res.json(user);
    });
});

module.exports = router
