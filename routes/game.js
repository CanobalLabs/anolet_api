const express = require('express');
let router = express.Router();
const Game = require("../models/game.js");

router.route("/s").get((req, res) => {
    // remember for frontend devs, pages start at 0 on the backend
    var query = {};
    var page = 0;
    if (req.query.page) page = req.query.page
    Game.find(query, undefined, { skip: 20 * page, limit: 20, sort: { playing: "desc" } }, function (err, results) {
        res.json(results)
    });
});

router.route("/:gameId").get((req, res) => {
    Game.findOne({ "id": req.params.gameId }).then(game => {
        delete game.gdp;
        if (req.params.gameId == 1 || req.headers.serverauth == process.env.HASH) {
            res.json(game);
        } else {
            delete game.zones
            delete game.worldSettings
            res.json(game);
        }
    });
});

module.exports = router
