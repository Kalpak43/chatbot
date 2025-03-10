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
    origin: "http://localhost:5173", // Allow requests from this origin
  })
);

app.use(express.json());
app.use(morgan("dev"));

const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

app.post("/chat", async (req, res) => {
  const { history } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).send({ msg: "Invalid chat history" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Convert chat history into a string
    const formattedHistory = history
      .map(({ role, text }) => `${role === "user" ? "User" : "AI"}: ${text}`)
      .join("\n");

    const aiResponseStream = ai.generateStream(
      `Chat history:\n${formattedHistory}\nAI:`
    ).stream;

    for await (const chunk of aiResponseStream) {
      const cleanedChunk = chunk.text
        ?.trim()
        .replace(/^```(json)?\n?|```$/g, "");
      if (cleanedChunk) {
        res.write(`data: ${JSON.stringify({ msg: cleanedChunk })}\n\n`);
      }
    }
    res.end();
  } catch (error) {
    console.error("Error streaming response:", error);
    res.write(`data: ${JSON.stringify({ error: "An error occurred." })}\n\n`);
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
