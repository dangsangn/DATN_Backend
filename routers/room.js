const router = require("express").Router();
const CryptoJS = require("Crypto-js");
const { verifyToken, verifyTokenAndAuthorization } = require("../middleware/auth");
const User = require("../models/User");
const Room = require("../models/Room");

//create a room
router.post("/", verifyToken, async (req, res) => {
  try {
    const room = new Room({ ...req.body, idUser: req.idUser });
    await room.save();
    res.status(202).json(room);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get a room
router.get("/:idRoom", async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.idRoom });
    if (!room) {
      return res.status(401).json("not found room");
    }
    res.status(202).json(room);
  } catch (error) {
    res.status(500).json(error);
  }
});

//update room
router.patch("/:idRoom", verifyToken, async (req, res) => {
  try {
    const newRoom = await Room.findByIdAndUpdate(
      { _id: req.params.idRoom },
      { $set: req.body },
      { new: true }
    );
    res.status(202).json(newRoom);
  } catch (error) {
    res.status(500).json(error);
  }
});

//delete a room
router.delete("/:idRoom", verifyToken, async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ _id: req.params.idRoom });
    if (!room) {
      return res.status(401).json("not found room");
    }
    res.status(202).json("delete success");
  } catch (error) {
    res.status(500).json(error);
  }
});

//get all room or pagination
router.get("/", async (req, res) => {
  let { _limit, _page } = req.query;
  const queryNew = req.query.new;
  _page = _page < 1 ? 1 : _page;
  _limit = _limit ? _limit : 10;
  const totalRow = await Room.count();
  if (_page) {
    try {
      let rooms = queryNew
        ? await Room.find()
            .sort({ _id: -1 })
            .skip((_page - 1) * _limit)
            .limit(+_limit)
        : await Room.find()
            .skip((_page - 1) * _limit)
            .limit(+_limit);

      res.status(202).json({
        rooms,
        pagination: { _limit: +_limit, _page: +_page, totalRow },
      });
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    try {
      const rooms = Room.find();
      res.status(202).json({
        rooms,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

module.exports = router;
