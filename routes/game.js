const express = require('express');
let router = express.Router();
const Game = require("../models/game.js");

router.route("/:gameId").get((req, res) => {
    Game.findOne({ "id": req.params.gameId }).then(game => {
        res.json(game);
    });
});

module.exports = router