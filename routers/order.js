const router = require("express").Router();
const CryptoJS = require("crypto-js");
const { verifyToken, verifyTokenAndAuthorization, verifyAdmin } = require("../middleware/auth");
const Order = require("../models/Order");
const Room = require("../models/Room");

//confirm order
router.patch("/confirm/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { isConfirm: true } },
      { new: true }
    );
    if (!order) {
      return res.status(400).json({ message: "not found order" });
    }
    return res.json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

//refuse order
router.patch("/refuse/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(400).json({ message: "not found order" });
    }
    let room = await Room.findById(order.room);
    if (req.body.message) {
      await Order.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: { message: req.body.message } },
        { new: true }
      );
    }
    const findIndex = room.userOrder.findIndex((item) => String(item) === req.params.id);
    if (findIndex === -1) {
      return res.status(400).json({ message: "order not found" });
    }
    const userOrder = room.userOrder.filter((item) => String(item) !== req.params.id);
    const ordered = room.ordered;
    room = await Room.findByIdAndUpdate(
      { _id: order.room },
      { $set: { userOrder, ordered: ordered - order.count } },
      { new: true }
    );
    res.json(room);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

//get a order
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", {
      username: 1,
      email: 1,
      phoneNumber: 1,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

//get list order of user
router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.idUser });
    res.json(orders);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
