const passport = require("passport");
const cookieSession = require("cookie-session");
const { configureGoogleAuth } = require("./google");
const userModel = require("../../models/user.model");
const { configureLocalAuth } = require("./local");

function configureAuth(app) {
  app.use(
    cookieSession({
      name: "Session",
      maxAge: 1000 * 60 * 60 * 24 * 30,
      keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_2],
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
  );

  app.use((req, res, next) => {
    if (!req.session) {
      return next(new Error("Session not found"));
    }

    req.session.regenerate = (cb) => {
      cb();
    };

    req.session.save = (cb) => {
      cb();
    };

    next();
  });

  // Passport serialization
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      console.log(user);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

  // Configure passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  configureLocalAuth();
  configureGoogleAuth();
}

function checkLoggedin(req, res, next) {
  const isLoggedin = req.isAuthenticated() && req.user;

  if (!isLoggedin) {
    return res.status(401).send({
      error: "You must log in",
    });
  }

  next();
}

module.exports = { configureAuth, checkLoggedin };
