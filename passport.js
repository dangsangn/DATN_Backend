const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
const User = require("./models/User");
const CryptoJS = require("Crypto-js");

const GOOGLE_CLIENT_ID = "231323238286-rd0m76u7b07gok8jfhf10uueq65fjmgs.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

FACEBOOK_APP_ID = "your id";
FACEBOOK_APP_SECRET = "your id";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  console.log("1", user);
  const usernameExised = await User.findOne({
    username: user.displayName,
  });
  if (!usernameExised) {
    const passwordCode = CryptoJS.AES.encrypt(user.id, process.env.PASS_SECRET).toString();
    const newUser = new User({
      username: user.displayName,
      password: passwordCode,
      photo: user.photos.value,
      email: "" + Math.random() + Math.random(),
    });
    await newUser.save();
  }

  done(null, user);
});
