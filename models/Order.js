const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OrderSchema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users" },
    room: {
      type: Schema.Types.ObjectId,
      ref: "rooms",
    },
    count: { type: Number, default: 1 },
    isConfirm: { type: Boolean, default: false },
    message: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("orders", OrderSchema);
