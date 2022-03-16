const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new mongoose.Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: Number,
    },
    content: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notifications", NotificationSchema);
