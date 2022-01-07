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
    res.status(400).json("field is not emptied");
  }
  if (password !== passwordConfirm) {
    res.status(400).json("password confirm is not correct");
  }
  const usernameExised = await User.findOne({ username });
  if (usernameExised) {
    res.status(400).json("username is really exist");
  }
  //all done
  try {
    const passwordCode = CryptoJS.AES.encrypt(password, process.env.PASS_SECRET).toString();
    const user = new User({
      username: username,
      password: passwordCode,
      email: "" + Math.random() + Math.random(),
    });
    await user.save();
    res.status(201).json("register success");
  } catch (error) {
    res.status(500).json(error);
  }
});

//login user
router.post("/login", async (req, res) => {
  const { username } = req.body;
  const usernameExised = await User.findOne({ username });
  if (!usernameExised) {
    res.status(400).json("username is not correct");
  }
  const hashedPassword = CryptoJS.AES.decrypt(usernameExised.password, process.env.PASS_SECRET);
  const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
  if (OriginalPassword !== req.body.password) {
    res.status(400).json("password is not correct");
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

//login by google and facebook
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successfull",
      user: req.user,
      //   cookies: req.cookies
    });
  } else {
    res.status(400).json({
      success: false,
      message: "failured",
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_URL);
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

router.get("/facebook", passport.authenticate("facebook", { scope: ["profile"] }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

module.exports = router;
