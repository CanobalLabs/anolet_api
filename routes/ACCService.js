module.exports = function (client) {
    const express = require('express');
    let router = express.Router();
    const Game = require("../models/game.js");
    router.route("/:gameId/requestGameLaunchAuthorization").get((req, res) => {
        Game.findOne({ "id": req.params.gameId }).then(game => {
            if (game == null) return res.status(404).send();
            if (game.privacyLevel == 0) {
                // Any user can access, authorize.
                client.set(`key:${game.id}:${res.locals.id}`, 0x0, { EXP: 60 });
                res.send()
            } else if (game.privacyLevel == 1) {
                // Only the creator can access, check
                if (res.locals.id == game.creator.id) {
                    client.set(`key:${game.id}:${res.locals.id}`, 0x0, { EXP: 60 });
                    res.send()
                } else {
                    res.status(403).send("You do not own that game.")
                }
            }
        });
    });
    return router
}