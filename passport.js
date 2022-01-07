const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
const User = require("./models/User");
const CryptoJS = require("crypto-js");

const GOOGLE_CLIENT_ID = "242801633846-50fdse8v25itk5l8euopglu77pl5tsob.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

FACEBOOK_APP_ID = "your id";
FACEBOOK_APP_SECRET = "your id";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "https://doan-totnghiep-2603.herokuapp.com/api/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // Check if google profile exist.
      if (profile.id) {
        User.findOne({ googleId: profile.id }).then((existingUser) => {
          if (existingUser) {
            done(null, existingUser);
          } else {
            new User({
              googleId: profile.id,
              email: profile.emails[0].value,
              username: profile.emails[0].value,
              fullName: profile.name.familyName + " " + profile.name.givenName,
              photo: profile.photos.value,
            })
              .save()
              .then((user) => done(null, user));
          }
        });
      }
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

passport.deserializeUser((user, done) => {
  done(null, user);
});
