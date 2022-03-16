const router = require("express").Router();
const CryptoJS = require("crypto-js");
const { verifyToken, verifyTokenAndAuthorization, verifyAdmin } = require("../middleware/auth");
const User = require("../models/User");
const Room = require("../models/Room");
const Order = require("../models/Order");

//create a room
router.post("/", verifyToken, async (req, res) => {
  try {
    const room = new Room({ ...req.body, owner: req.idUser });
    await room.save();
    res.status(202).json(room);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get room of user
router.get("/user-room", verifyToken, async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.idUser }).sort({ _id: -1 });
    res.json(rooms);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//GET ROOM STATISTIC
router.get("/statistic-month", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await Room.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ROOM STATISTIC BY DISTRICT
router.get("/statistic-district", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await Room.aggregate([
      { $match: { "city.label": "Thành phố Đà Nẵng" } },
      { $project: { district: 1 } },
      {
        $group: {
          _id: "$district.label",
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 4 },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/statistic-district", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await Room.aggregate([
      { $match: { "city.label": "Thành phố Đà Nẵng" } },
      { $project: { district: 1 } },
      {
        $group: {
          _id: "$district.label",
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 4 },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/statistic-district-all", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await Room.aggregate([
      { $match: { "city.label": "Thành phố Đà Nẵng" } },
      { $project: { district: 1 } },
      {
        $group: {
          _id: "$district.label",
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a room
router.get("/:idRoom", async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.idRoom }).populate("owner", {
      username: 1,
      email: 1,
      phoneNumber: 1,
    });
    if (!room) {
      return res.status(401).json("not found room");
    }
    res.status(202).json(room);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//verify room
router.patch("/verify/:idRoom", verifyAdmin, async (req, res) => {
  // console.log(req.params.idRoom, req.body.verify);
  try {
    const room = await Room.findByIdAndUpdate(
      { _id: req.params.idRoom },
      { $set: { verify: req.body.verify } },
      { new: true }
    );
    res.status(202).json(room);
  } catch (error) {
    res.status(500).json(error);
  }
});

//update-room-order
router.patch("/update-room-order/:id", verifyToken, async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);
    const count = +req.body.count;
    if (count > room.quantityRoom - room.ordered) {
      return res.status(400).json({ message: "order number is greater than we have" });
    }
    if (String(room.owner) === req?.idUser) {
      return res.status(400).json({ message: "your are owner's room." });
    }
    if (room.ordered >= room.quantityRoom) {
      return res.status(400).json({ message: "room is out of" });
    }

    //create a order for user to save in rooms table
    const order = new Order({ room: req.params.id, user: req.idUser, count: count });
    await order.save();
    const userOrder = [...room.userOrder, order._id];
    room = await Room.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          userOrder: userOrder,
          ordered: room.ordered + count,
        },
      },
      { new: true }
    );
    return res.status(202).json(room);
  } catch (error) {
    console.log(error);
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
  // console.log("req.query", req.query);
  let verify = req.query?.verify || false;
  let page = req.query?._page;
  let limit = req.query?._limit;
  let _q = req.query?.q || "";

  let price_lte = req.query?.price ? req.query?.price[0] * 1000000 : 0;
  let price_gte = req.query?.price ? req.query?.price[1] * 1000000 : 15000000;
  let typeRoom =
    (req.query?.typeRoom && typeof req.query?.typeRoom === "string"
      ? [req.query?.typeRoom]
      : req.query?.typeRoom) || [];
  let utilities =
    (req.query?.utilities && typeof req.query?.utilities === "string"
      ? [req.query?.utilities]
      : req.query?.utilities) || [];
  let gender = +req.query?.gender;

  // console.log("req.query", typeRoom);
  let queryCondition = {
    $or: [
      { "ward.label": { $regex: ".*" + _q + ".*", $options: "i" } },
      { "district.label": { $regex: ".*" + _q + ".*", $options: "i" } },
      { "city.label": { $regex: ".*" + _q + ".*", $options: "i" } },
      { nameStress: { $regex: ".*" + _q + ".*", $options: "i" } },
    ],
    priceRoom: { $lte: price_gte, $gte: price_lte },
  };
  if (verify) {
    queryCondition["verify"] = verify;
  }
  if (typeRoom.length > 0) {
    queryCondition["typeRoom"] = { $in: typeRoom };
  }
  if (gender && gender !== 3) {
    queryCondition["gender"] = gender;
  }
  if (utilities.length > 0) {
    const arr = [];
    for (let i = 0; i < utilities.length; i++) {
      arr.push({ utilities: utilities[i] });
    }
    queryCondition["$and"] = arr;
  }
  // console.log("queryCondition", queryCondition);
  if (page) {
    page = page < 1 ? 1 : page;
    limit = limit ? limit : 10;
    try {
      let rooms = await Room.find(queryCondition)
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(+limit);

      const totalRow = await Room.find(queryCondition).count();
      res.status(202).json({
        rooms,
        pagination: { _limit: +limit, _page: +page, totalRow },
      });
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    try {
      const rooms = await Room.find(queryCondition).sort({ _id: -1 });
      res.status(202).json({
        rooms,
      });
    } catch (error) {
      // console.log(error);
      res.status(500).json(error);
    }
  }
});

//get all room verify
router.get("/verify", async (req, res) => {
  let { _limit, _page } = req.query;
  const queryNew = req.query.new;
  _page = _page < 1 ? 1 : _page;
  _limit = _limit ? _limit : 10;
  const totalRow = await Room.count();
  if (_page) {
    try {
      let rooms = await Room.find({ verify: true })
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
