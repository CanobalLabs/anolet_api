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

router.route("/:gameId/cacheableAssets").get((req, res) => {
    Game.findOne({ "id": req.params.gameId }).then(game => {
        // Returns all assetURLs, add game privacy check soon
        res.json(game.zones.map(zone => zone.layers.map(layer => layer.assetURL)));
    });
});

router.route("/:gameId").get((req, res) => {
    Game.findOne({ "id": req.params.gameId }).then(game => {
        if (game == null) return res.status(404).send()
        delete game.gdp;
        if (req.params.gameId == 1 || req.headers.serverauth == process.env.HASH) {
            res.json(game);
        } else {
            game.zones = undefined;
            game.worldSettings = undefined;
            res.json(game);
        }
    });
});

module.exports = router
