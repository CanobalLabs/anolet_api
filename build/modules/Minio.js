"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minio = void 0;
const Minio = require("minio");
exports.minio = new Minio.Client({
    endPoint: process.env.S3_ENDPOINT,
    useSSL: true,
    accessKey: process.env.S3_ACCESS_KEY_ID,
    secretKey: process.env.S3_SECRET_ACCESS_KEY
});
