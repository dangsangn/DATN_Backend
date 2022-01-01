const router = require("express").Router();
const CryptoJS = require("crypto-js");
const { verifyTokenAndAuthorization, verifyToken } = require("../middleware/auth");
const User = require("../models/User");

//get profile user
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.idUser });
    if (!user) {
      return res.status(401).json("not found user");
    }
    const {...info, password} = user._doc;
    res.status(202).json(info);
  } catch (error) {
    res.status(500).json(error);
  }
});
//get a user
router.get("/:idUser", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.idUser });
    if (!user) {
      return res.status(401).json("not found user");
    }
    const {...info, password} = user._doc;
    res.status(202).json(info);
  } catch (error) {
    res.status(500).json(error);
  }
});

//update user
router.patch("/:idUser", verifyTokenAndAuthorization, async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SECRET
      ).toString();
    }
    const newUser = await User.findByIdAndUpdate(
      { _id: req.params.idUser },
      { $set: req.body },
      { new: true }
    );
    res.status(202).json(newUser);
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
    res.status(202).json("delete success");
  } catch (error) {
    res.status(500).json(error);
  }
});

//get all user or pagination
router.get("/", verifyTokenAndAuthorization, async (req, res) => {
  let { _limit, _page } = req.query;
  const queryNew = req.query.new;
  _page = _page < 1 ? 1 : _page;
  _limit = _limit ? _limit : 10;
  const totalRow = await User.count();
  if (_page) {
    try {
      let users = queryNew
        ? await User.find()
            .sort({ _id: -1 })
            .skip((_page - 1) * _limit)
            .limit(+_limit)
        : await User.find()
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
      const users = User.find();
      res.status(202).json({
        users,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

module.exports = router;
