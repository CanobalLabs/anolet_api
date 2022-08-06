const express = require('express');
let router = express.Router();
const Game = require("../models/game.js");
const jwt = require('jsonwebtoken');

router.route("/:gameId/requestGameLaunchAuthorization").get((req, res) => {
    Game.findOne({ "id": req.params.gameId }).then(game => {
        if (game == null) return res.status(404).send();
        // for partial legacy compatibility
        if (game.privacyLevel == 0 || game.privacyLevel == -1) {
            // Any user can access, authorize.
            res.send(jwt.sign({ game: req.params.gameId, user: res.locals.id }, process.env.HASH, { expiresIn: "30s" }));
        } else if (game.privacyLevel == 1) {
            // Only the creator can access, check
            if (res.locals.id == game.creator.id) {
                res.send(jwt.sign({ game: req.params.gameId, user: res.locals.id }, process.env.HASH, { expiresIn: "30s" }));
            } else {
                res.status(403).send("You do not own that game.")
            }
        }
    });
});

router.route("/:gameId/increaseVisitCount").get((req, res) => {
    if (req.headers.serverauth == process.env.HASH) {
        Game.findOne({ "id": req.params.gameId }).then(game => {
            if (game == null) return res.status(404).send();
            Game.updateOne({ id: req.params.gameId }, { $inc: { visits: 1 } }).then(() => {
                res.send();
            });
        });
    } else res.status(403).send("You do not have permission to do that.");
});

router.route("/:gameId/setPlayerCount/:count").get((req, res) => {
    if (req.headers.serverauth == process.env.HASH) {
        Game.findOne({ "id": req.params.gameId }).then(game => {
            if (game == null) return res.status(404).send();
            Game.updateOne({ id: req.params.gameId }, { $set: { playing: req.params.count } }).then(() => {
                res.send();
            });
        });
    } else res.status(403).send("You do not have permission to do that.");
});

module.exports = router