import express from "express";
import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import cors from "cors";
import { genkit } from "genkit";
import env from "dotenv";
import morgan from "morgan";

env.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: "http://127.0.0.1:5173/", // Allow requests from this origin
  })
);

app.use(express.json());
app.use(morgan("dev"));

const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

const res = ai.generateStream("What is capital of Delhi?");

for await (const chunk of res.stream) {
  const cleanedChunk = chunk.text?.trim().replace(/^```(json)?\n?|```$/g, "");
  if (cleanedChunk) {
    console.log(`data: ${JSON.stringify({ msg: cleanedChunk })}\n\n`);
  }
}
