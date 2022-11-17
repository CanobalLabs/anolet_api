const express = require('express');
let router = express.Router();
const User = require("../models/user.js");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const CheckUsername = require("../modules/CheckUsername.js");
const { validate } = require('express-validation');
const validation = require("../validation/user/auth.js");
const GenerateToken = require("../modules/GenerateToken.js");

router.post("/signup", validate(validation, {}, {}), async (req, res) => {
    if (await CheckUsername(req.body.username) || /^[a-zA-Z0-9_.-]*$/.test(req.body.username) == false) {
        return res.status(400).json({
            token: null,
            error: "Username already exists or is invalid."
        });
    }
    let uid = uuidv4();
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        new User({
            id: uid,
            defaultRender: true,
            created: new Date(),
            username: req.body.username,
            password: hash, amulets: 100,
            about: "I don't have a bio, but I can change that!",
            belongings: {
                accessories: ["a05b72b1-15b2-4d4a-b45e-1d1a9488bd4d"],
                bodies: ["3d62ac6b-b48f-43ac-a8bf-f43040e75111"],
                faces: ["0aff884e-112b-45dd-afd3-afa1ff3ec3c2"],
                shoes: []
            },
            avatar: {
                accessories: ["a05b72b1-15b2-4d4a-b45e-1d1a9488bd4d"],
                bodies: ["3d62ac6b-b48f-43ac-a8bf-f43040e75111"],
                faces: ["0aff884e-112b-45dd-afd3-afa1ff3ec3c2"],
                shoes: []
            }
        }).save();
        res.json({ token: GenerateToken(uid), error: false });
    });
});

router.post("/", validate(validation, {}, {}), async (req, res) => {
    User.findOne({ username: { $regex: new RegExp(req.body.username, "i") } }).then(response => {
        if (response == null) return res.status(400).json({
            token: null,
            error: "An account with that username does not exist."
        });
        bcrypt.compare(req.body.password, response.password, function (err, result) {
            if (result) {
                res.json({ token: GenerateToken(response.id), error: false });
            } else {
                res.status(400).json({
                    token: null,
                    error: "Incorrect password."
                });
            }
        });
    });
});

module.exports = router
