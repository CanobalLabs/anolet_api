process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});

import express from 'express';
import path from "path";
import fs from "fs";
import cors from "cors";
import { ValidationError } from "express-validation";
import { checkAuth } from "./modules/CheckAuth";

require("./modules/Mongoose");

const app = express();
app.use(express.json());
app.use(cors())
app.use("*", checkAuth);

app.get("/asset/specialitem-1/:hex", (req, res) => {
  if (!/^#([0-9a-f]{3}){1,2}$/i.test('#' + req.params.hex)) return res.send("Invalid hex color")
  fs.readFile(path.join(__dirname, '/generator') + "/Body.svg", function read(err, data) {
    if (err) {
        throw err;
    }
  
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(data.toString().replace("<$bodyColor$>", "#" + req.params.hex));
  });
});

app.use(function(req, res, next) {
  res.removeHeader("x-powered-by");
  res.setHeader('x-platform', process.platform)
  res.setHeader('x-pid', process.pid)
  res.setHeader('x-ppid', process.ppid)
  next();
});

// Import Routes
import {router as UserRoute} from "./routes/user";
import {router as CanobalLabsRoute} from "./routes/canobalLabs";
import {router as GameRoute} from "./routes/game";
import {router as ItemRoute} from "./routes/item";
import {router as GangRoute} from "./routes/gang";
import {router as ACCService} from "./routes/ACCService";

// Use Routes
app.use("/user", UserRoute);
app.use("/canobalLabs", CanobalLabsRoute);
app.use("/game", GameRoute);
app.use("/item", ItemRoute);
app.use("/gang", GangRoute);
app.use("/ACCService", ACCService);

// Error Handler
app.use(function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err)
  } else {
    console.error(err)
    return res.status(500).send(err)
  }
});

// Start Server
app.listen(process.env.PORT || 8080, () => {
  console.log("Server Started");
});