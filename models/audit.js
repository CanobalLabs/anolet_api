const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const auditSchema = new Schema({
   fromUser: {
         type: String,
         required: true
   },
   toObject: {
         type: String,
         required: true
   },
   objectType: {
         type: String,
         required: true,
         enum: ['user', 'group', 'game', 'item', 'website']
   },
   action: {
         type: String,
         required: true,
   },
   at: {
         type: Date,
         required: true,
   },
});

const Audit = mongoose.model("Audit", auditSchema);
module.exports = Audit;
