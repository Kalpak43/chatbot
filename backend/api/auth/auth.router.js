const express = require("express");
const passport = require("passport");

const { register, signout, refreshToken } = require("./auth.controller");
const { signinWithGoogle } = require("./oauth/google.controller");
const { checkLoggedin } = require("../../middlewares/auth/auth.middleware");
const { redirectUri } = require("../../const");

const router = express.Router();

router.get("/check", checkLoggedin, (req, res) => {
  const user = req.user.toObject();
  delete user.password;
  delete user.__v;

  res.status(200).json({ isAuthenticated: true, user });
});

router.post("/register", register);
router.post("/signin", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      // Sending the custom error message from `verifyToken`
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log in" });
      }
      return res.json({ message: "Login successful", user });
    });
  })(req, res, next);
});

router.get("/signout", signout);
router.post("/refreshToken", refreshToken);

router.get(
  "/google",
  signinWithGoogle,
  passport.authenticate("google", {
    scope: ["email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
  }),
  (req, res) => {
    const redirectTo = req.session.redirect || redirectUri.rd;

    console.log("----------------------------");
    console.log(redirectTo);
    console.log(req.session.redirect);
    console.log("----------------------------");

    delete req.session.redirect; // Clean up after use
    res.redirect(redirectTo);
  }
);

module.exports = router;
