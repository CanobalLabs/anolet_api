const express = require('express');
let router = express.Router();
const Game = require("../models/game.js");

router.route("/:gameId").get((req, res) => {
    Game.findOne({ "id": req.params.gameId }).then(game => {
        // TODO: remove ingame data if they don't meet the privacy requirement
        delete game.gdp;
        res.json(game);
    });
});

module.exports = router