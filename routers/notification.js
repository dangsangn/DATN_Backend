const router = require("express").Router();
const CryptoJS = require("crypto-js");
const { verifyToken } = require("../middleware/auth");
const Notification = require("../models/Notification");

//create a notification
router.post("/", verifyToken, async (req, res) => {
  try {
    const notification = new Notification({ ...req.body, type: +req.body?.type || 1 });
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

//get notification no read of user
router.get("/no-read", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.idUser,
      isRead: false,
    }).populate("sender", {
      username: 1,
      email: 1,
      phoneNumber: 1,
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

router.get("/total-no-read", verifyToken, async (req, res) => {
  try {
    const countNotRead = await Notification.find({ receiver: req.idUser, isRead: false }).count();
    res.status(202).json(countNotRead);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

//get notification of user
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.idUser })
      .populate("sender", {
        username: 1,
        email: 1,
        phoneNumber: 1,
      })
      .sort({ _id: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

//update isRead is true
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { isRead: true } },
      { new: true }
    );
    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

//delete a notification
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.findByIdAndDelete(
      { _id: req.params.id },
    );
    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
