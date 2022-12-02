const mongoose = require("mongoose");

const suspensionSchema = mongoose.Schema({
    type: String,
    source: String,
    sourceName: String,
    sourceContent: String,
    sourceContentType: String,
    reason: String,
    suspensionEnd: Date,
    internalNote: String,
    acknowledged: Boolean
});

module.exports = suspensionSchema;