const router = require("express").Router();
const CryptoJS = require("crypto-js");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const CLIENT_URL = "http://localhost:3000";
//register user
router.post("/register", async (req, res) => {
  const { username, password, passwordConfirm } = req.body;
  if (!username || !password || !passwordConfirm) {
    return res.status(202).json("field is not emptied");
  }
  if (password !== passwordConfirm) {
    return res.status(202).json("password confirm is not correct");
  }
  const usernameExised = await User.findOne({ username });
  if (usernameExised) {
    return res.status(202).json("username is really exist");
  }
  //all done
  try {
    const passwordCode = CryptoJS.AES.encrypt(password, process.env.PASS_SECRET).toString();
    const user = new User({
      username: username,
      password: passwordCode,
      email: req.body?.email || "",
    });
    await user.save();
    res.status(201).json("register success");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//check user by email
router.get("/email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      return res.status(200).json(true);
    } else {
      return res.status(200).json(false);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//login user
router.post("/login", async (req, res) => {
  const { username } = req.body;
  const usernameExised = await User.findOne({ username });
  if (!usernameExised) {
    return res.status(400).json("username is not correct");
  }
  const hashedPassword = CryptoJS.AES.decrypt(usernameExised?.password, process.env.PASS_SECRET);
  const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
  if (OriginalPassword !== req.body.password) {
    return res.status(400).json("password is not correct");
  }
  const accessToken = jwt.sign(
    {
      idUser: usernameExised._id,
      isAdmin: usernameExised.isAdmin,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "3d" }
  );
  const { password, ...user } = usernameExised._doc;
  try {
    res.status(200).json({ user, accessToken });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
