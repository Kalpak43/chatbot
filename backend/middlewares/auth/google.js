require("dotenv").config();

const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const userModel = require("../../models/user.model");

const config = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_SECRET,
};

const AUTH_OPTIONS = {
  callbackURL: "/api/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

async function verifyToken(accessToken, refreshToken, profile, done) {
  try {
    let user = await userModel.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = new userModel({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        profilePicture: profile.photos[0].value,
      });
    } else {
      userModel.googleId = profile.id; // Link Google account if user exists
      userModel.profilePicture = profile.photos[0].value;
    }

    await user.save();

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}

function configureGoogleAuth() {
  passport.use(new Strategy(AUTH_OPTIONS, verifyToken));
}

module.exports = {
  configureGoogleAuth,
};
