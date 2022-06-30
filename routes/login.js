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
    if (await CheckUsername(req.body.username)) {
        return res.status(400).json({
            token: null,
            error: "Username already exists."
        });
    }
    let uid = uuidv4();
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        new User({ id: uid, username: req.body.username, password: hash, amulets: 100, about: "I don't have a bio, but I can change that!" }).save();
        res.json({ token: GenerateToken(uid), error: false });
    });
});

router.post("/", validate(validation, {}, {}), async (req, res) => {
    User.findOne({ username: { $regex : new RegExp(req.body.username, "i") } }).then(response => {
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
