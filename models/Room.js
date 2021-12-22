const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const RoomSchema = new mongoose.Schema(
  {
    idUser: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    nameStress: { type: String, required: true },
    numberHome: { type: String, required: true },
    priceRoom: { type: Number, required: true },
    priceDeposit: { type: Number },
    typeRoom: { type: Number },
    stretch: { type: Number, required: true },
    gender: { type: Number },
    capacity: { type: Number, required: true },
    priceElectric: { type: Number, required: true },
    priceWater: { type: Number, required: true },
    priceWifi: { type: Number, required: true },
    images: { type: Array, required: true },
    utilities: { type: Array },
    quantityRoom: { type: Number },
    ordered: { type: Number },
    description: { type: String },
    verify: { type: Boolean },
    ward: { type: Object },
    district: { type: Object },
    city: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("rooms", RoomSchema);
