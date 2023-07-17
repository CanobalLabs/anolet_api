import mongoose from "mongoose";

const Schema = mongoose.Schema;

export const Audit = mongoose.model("Audit", new Schema({
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
}));
