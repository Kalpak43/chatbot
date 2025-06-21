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

import { router as chatRoutes } from "./api/chat/chat.router.js";
import userRoutes from "./api/user/user.router.js"
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_URL,
    credentials: true,
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  })
);

app.use(express.json());
app.use(morgan("short"));

const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
});

app.use(globalLimiter)


app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

app.get("/health", (req, res) => {
  res.status(200).send("Healthy!!!")
})

app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);

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
