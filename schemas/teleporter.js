const mongoose = require("mongoose");

const teleporterSchema = mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    toZone: {
        type: String,
        required: true,
    },
    locationPolyline: [[]]
});

module.exports = teleporterSchema;