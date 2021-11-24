const mongoose = require("mongoose");

const RoomsFavorateSchema = new mongoose.Schema(
  {
    idUser: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    listRooms: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("roomsfavorate", RoomsFavorateSchema);
