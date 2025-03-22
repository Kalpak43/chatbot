require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connection.once("open", () => {
  console.log("Mongoose connected Successfully!!!");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function connectToDB() {
  await mongoose.connect(MONGO_URI);
}

module.exports = { connectToDB };
