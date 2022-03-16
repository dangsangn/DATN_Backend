const router = require("express").Router();
const CryptoJS = require("crypto-js");
const { verifyTokenAndAuthorization, verifyToken } = require("../middleware/auth");
const User = require("../models/User");
const Room = require("../models/Room");
//get profile user
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.idUser });
    if (!user) {
      return res.status(401).json("not found user");
    }
    const { password, ...info } = user._doc;
    res.status(202).json(info);
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET User STATISTIC
router.get("/statistic-month", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await User.aggregate([
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

//get a user
router.get("/:idUser", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.idUser });
    if (!user) {
      return res.status(401).json("not found user");
    }
    const { password, ...info } = user._doc;
    res.status(202).json(info);
  } catch (error) {
    res.status(500).json(error);
  }
});

//update password
router.patch("/update-password/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const { passwordConfirm } = req.body;
    const passwordRequest = req.body.password;
    if (passwordRequest !== passwordConfirm) {
      res.status(300).json({ message: "password don't match" });
    }
    const passwordCode = CryptoJS.AES.encrypt(passwordRequest, process.env.PASS_SECRET).toString();
    const user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { password: passwordCode } },
      { new: true }
    );
    const { password, ...info } = user._doc;
    res.status(200).json({ message: "success", user: info });
  } catch (error) {
    res.status(500).json(error);
  }
});
//update user
router.patch("/:idUser", verifyTokenAndAuthorization, async (req, res) => {
  // console.log("req.body", req.body);
  try {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SECRET
      ).toString();
    }
    const updateUser = await User.findByIdAndUpdate(
      { _id: req.params.idUser },
      { $set: req.body },
      { new: true }
    );
    const { password, ...info } = updateUser._doc;
    res.status(202).json(info);
  } catch (error) {
    res.status(500).json(error);
  }
});

//delete a user
router.delete("/:idUser", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.idUser });
    if (!user) {
      return res.status(401).json("not found user");
    }
    await Room.deleteMany({ owner: req.params.idUser });
    res.status(202).json("delete success");
  } catch (error) {
    console.log("error", error);
    res.status(500).json(error);
  }
});

//get all user or pagination
router.get("/", verifyTokenAndAuthorization, async (req, res) => {
  let _page = req.query?._page;
  let _limit = req.query?._limit;
  let _q = req.query?.q || "";
  const queryNew = req.query?.new;
  if (_page) {
    _page = _page < 1 ? 1 : _page;
    _limit = _limit ? _limit : 10;
    const totalRow = await User.count();
    try {
      let users = queryNew
        ? await User.find({ isAdmin: false, username: { $regex: ".*" + _q + ".*" } })
            .sort({ _id: -1 })
            .skip((_page - 1) * _limit)
            .limit(+_limit)
        : await User.find({ isAdmin: false, username: { $regex: ".*" + _q + ".*" } })
            .skip((_page - 1) * _limit)
            .limit(+_limit);

      res.status(202).json({
        users,
        pagination: { _limit: +_limit, _page: +_page, totalRow },
      });
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    try {
      const users = await User.find({ isAdmin: false, username: { $regex: ".*" + _q + ".*" } });
      res.status(202).json({
        users,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

module.exports = router;
