import dotenv from "dotenv";

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connection.once("open", () => {
  console.log("Mongoose connected Successfully!!!");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

export async function connectToDB() {
  await mongoose.connect(MONGO_URI);
}
