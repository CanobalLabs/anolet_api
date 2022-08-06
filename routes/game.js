const express = require('express');
let router = express.Router();
const Game = require("../models/game.js");

router.route("/s").get((req, res) => {
    // remember for frontend devs, pages start at 0 on the backend
    var query = {};
    var page = 0;
    if (req.query.page) page = req.query.page
    Game.find(query, undefined, { skip: 20 * page, limit: 20 }, function (err, results) {
        res.json(results.sort(playing: "desc"))
    });
});

router.route("/:gameId").get((req, res) => {
    Game.findOne({ "id": req.params.gameId }).then(game => {
        delete game.gdp;
        if (req.headers.serverauth == process.env.HASH) {
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