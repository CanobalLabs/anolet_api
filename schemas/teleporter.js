const mongoose = require("mongoose");

const teleporterSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    toZone: {
        type: Number,
        required: true,
    },
    locationPolyline: [[]]
});

module.exports = teleporterSchema;