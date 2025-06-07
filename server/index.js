import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dotenv from "dotenv";
import path from "path";
import morgan from "morgan";

import express from "express";
import cors from "cors";

import { connectToDB } from "./db/mongo.db.js";

import { router as chatRotues } from "./api/chat/chat.router.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("short"));

// app.get("/secret", checkLoggedin, (req, res) => {
//   res.status(200).send("43");
// });

app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

app.get("/health", (req, res) => {
  res.status(200).send("Healthy!!!")
})

app.get("/failure", (req, res) => {
  res.send("Auth failed");
});
app.get("/success", (req, res) => {
  res.send("Auth succeeded");
});

app.use("/api/chat", chatRotues);

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 8080;

async function startServer() {
  // await connectToDB();

  await connectToDB();

  app.listen(PORT, () => {
    console.log(`Listening to http://localhost:${PORT}`);
  });
}

startServer();
