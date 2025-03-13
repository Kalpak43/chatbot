import express from "express";
import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import cors from "cors";
import { genkit } from "genkit";
import env from "dotenv";
import morgan from "morgan";
import { transcribeAudio } from "./utils.js";
import multer from "multer";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

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

app.post("/chat", upload.single("audio"), async (req, res) => {
  const { history: h } = req.body;
  let history = JSON.parse(h);
  let transcript = "";

  if (req.file) {
    try {
      transcript = await transcribeAudio(req.file.path);
      console.log(transcript);
      fs.unlinkSync(req.file.path); // Delete file after processing
    } catch (error) {
      console.log(error);
      return res.status(500).send({ msg: "Audio transcription failed" });
    }
  }

  if (!history || !Array.isArray(history)) {
    return res.status(400).send({ msg: "Invalid chat history" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (transcript.trim() !== "") {
    history.push({
      role: "user",
      text: transcript,
    });
  }

  try {
    // Convert chat history into a string
    const formattedHistory = history
      .map(({ role, text }) => `${role === "user" ? "User" : "AI"}: ${text}`)
      .join("\n");

    const aiResponseStream = ai.generateStream({
      system: `You are an AI chatbot which answers any of the questions asked by user. Please structure your response in the **Head, Body, Trunk** format as described below:

          
          - Provide a concise main answer or summary.  
          - Keep it direct and informative without unnecessary context.  

        Title of Body section:  
          - Explain the details of the answer in multiple **sub-sections** with **headings**.  
          - Use **bullet points or numbered lists** for clarity.  
          - Include **tables, formulas, and code blocks** where applicable.  
          - Keep responses structured and well-organized for easy understanding.  

        Title of Trunk section:  
          - Provide **conclusion, next steps, or recommendations** based on the prompt.  
          - Offer alternative approaches or additional considerations.  

        ### **Formatting Guidelines**
        - Use bullet points, numbered lists, and tables where necessary.  
        - Code blocks should be used for any programming-related content.  
        - Each section should be clearly separated for readability.  
        - Keep responses **concise (max 500 words)** unless explicitly asked for more details.  
        - Use **horizontal rules (---)** between sections and make sure to add a new line after each horizontal rule.  
        - Leave **two blank lines** between sections for readability.
        - For titles use h1, h2, h3 based on hierarchy.
        - do not show head, body and trunk as literal titles of the sections.
        - Please ensure that there no errors in the markdown syntax that you provide. Ensure that there is proper spacing between the markdown tags and the actual content so that it is easy to render.

        Ensure all responses strictly follow this format.`,
      prompt: `Chat history: ${formattedHistory}`,
    }).stream;

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

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  let transcript = "";

  console.log(req.file.path);

  if (req.file) {
    try {
      transcript = await transcribeAudio(req.file.path);
      console.log(transcript);
      fs.unlinkSync(req.file.path); // Delete file after processing
    } catch (error) {
      console.log(error);
      return res.status(500).send({ msg: "Audio transcription failed" });
    }
  } else {
    return res.status(400).send({ msg: "No File provided" });
  }

  return res.status(200).send({
    msg: transcript,
  });
});

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
