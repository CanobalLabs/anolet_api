const Minio = require("minio");

module.exports = new Minio.Client({
    endPoint: process.env.S3_ENDPOINT,
    useSSL: true,
    accessKey: process.env.S3_ACCESS_KEY_ID,
    secretKey: process.env.S3_SECRET_ACCESS_KEY
});