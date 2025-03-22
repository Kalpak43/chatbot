const userModel = require("../../models/user.model");
const asyncHandler = require("../../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    if (existingUser.googleId && !existingUser.password) {
      existingUser.password = password;
      await existingUser.save();

      return res
        .status(200)
        .send({ message: "User account linked with google" });
    } else {
      const err = new Error("User already exists");
      err.status = 400;
      throw err;
    }
  }

  const newUser = new userModel({ email, password });
  await newUser.save();

  return res.status(200).send({ message: "User registered" });
});

async function signin(req, res) {}

async function signout(req, res) {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error during logout", error: err });
    }
    return res.status(200).send({
      message: "Signed out successfully",
    });
  });
}

async function refreshToken(req, res) {}

module.exports = { register, signin, signout, refreshToken };
