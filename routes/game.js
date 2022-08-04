const express = require('express');
let router = express.Router();
const Game = require("../models/game.js");

router.route("/:gameId").get((req, res) => {
    Game.findOne({ "id": req.params.gameId }).then(game => {
        delete game.gdp;
        if (req.headers.ServerAuth == process.env.HASH) {
            res.json(game);
        } else {
            // When Anolet releases, this will be uncommented, this is for legacy compatibility with preview
            /* delete game.zones
            delete game.worldSettings */
            res.json(game);
        }
    });
});

module.exports = router