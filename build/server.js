"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const express_validation_1 = require("express-validation");
const CheckAuth_1 = require("./modules/CheckAuth");
require("./modules/Mongoose");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("*", CheckAuth_1.checkAuth);
app.get("/asset/specialitem-1/:hex", (req, res) => {
    if (!/^#([0-9a-f]{3}){1,2}$/i.test('#' + req.params.hex))
        return res.send("Invalid hex color");
    fs_1.default.readFile(path_1.default.join(__dirname, '/generator') + "/Body.svg", function read(err, data) {
        if (err) {
            throw err;
        }
        res.setHeader("Content-Type", "image/svg+xml");
        res.send(data.toString().replace("<$bodyColor$>", "#" + req.params.hex));
    });
});
app.use(function (req, res, next) {
    res.removeHeader("x-powered-by");
    res.setHeader('x-platform', process.platform);
    res.setHeader('x-pid', process.pid);
    res.setHeader('x-ppid', process.ppid);
    next();
});
// Import Routes
const user_1 = require("./routes/user");
const canobalLabs_1 = require("./routes/canobalLabs");
const game_1 = require("./routes/game");
const item_1 = require("./routes/item");
const gang_1 = require("./routes/gang");
const ACCService_1 = require("./routes/ACCService");
// Use Routes
app.use("/user", user_1.router);
app.use("/canobalLabs", canobalLabs_1.router);
app.use("/game", game_1.router);
app.use("/item", item_1.router);
app.use("/gang", gang_1.router);
app.use("/ACCService", ACCService_1.router);
// Error Handler
app.use(function (err, req, res, next) {
    if (err instanceof express_validation_1.ValidationError) {
        return res.status(err.statusCode).json(err);
    }
    else {
        console.error(err);
        return res.status(500).send(err);
    }
});
// Start Server
app.listen(process.env.PORT || 8080, () => {
    console.log("Server Started");
});
