const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
   asset: String,
   assetType: String,
   status: {
        type: String,
        enum : [
                  'success',
                  'refunded'
               ],
        default: 'success'
   },
   date: Date,
   gems: Number,
   increaseParty: String,
   decreaseParty: String
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
