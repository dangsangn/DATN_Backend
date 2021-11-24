const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    idUser: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    name: {
      type: String,
      required: true,
    },
    address: { type: String, required: true },
    priceRom: { type: Number, required: true },
    area: { type: Number, required: true },
    capacity: { type: Number, required: true },
    priceElectric: { type: Number, required: true },
    priceWater: { type: Number, required: true },
    priceWifi: { type: Number, required: true },
    status: { type: Boolean, required: true },
    images: { type: Array, required: true },
    numberRoom: { type: Number },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("rooms", RoomSchema);
