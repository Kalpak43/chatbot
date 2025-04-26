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

const admin = require("../../firebaseAdmin");

async function checkLoggedin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // you can now access req.user.uid etc
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

module.exports = { configureAuth, checkLoggedin };
