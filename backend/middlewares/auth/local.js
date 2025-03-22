const passport = require("passport");
const { Strategy } = require("passport-local");
const userModel = require("../../models/user.model");

async function verifyToken(email, password, done) {
  try {
    console.log(
      "----------------------------------------------------------------------------------"
    );
    console.log(email, password);
    const user = await userModel.findOne({ email });
    if (!user)
      return done(null, false, { message: "Email or Password is incorrect." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return done(null, false, { message: "Email or Password is incorrect." });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}

function configureLocalAuth() {
  passport.use(new Strategy({ usernameField: "email" }, verifyToken));
}

module.exports = {
  configureLocalAuth,
};
