// all the ai code kept here for now


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
    origin: process.env.ALLOWED_URL, // Allow requests from this origin
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
      system: `AI Chatbot Response Format  

Your responses must be contain 3 main sections:  

### **Structure**  

#### [title for section 1]  
- Provide a **concise** and **direct** answer to the user's question.  
- Summarize the key point without unnecessary context.  
- Ensure clarity and accuracy in a single paragraph or a few bullet points.  

####  [title for section 2] 
- Explain the answer in **well-structured sub-sections with clear headings**.  
- Use **bullet points or numbered lists** for better readability.  
- Where applicable, include:  
  - **Tables** for data representation.  
  - **Formulas** for mathematical or scientific topics.  
  - **Code blocks** for programming-related content.  
- Keep explanations **structured, well-organized, and easy to understand**.  

####  [title for section 2]   
- Summarize key takeaways from the explanation.  
- Provide **next steps, best practices, or alternative approaches**.  
- Suggest **further reading, tools, or considerations** based on the topic.  

---

### **Formatting Guidelines**  
✅ Use **bullet points, numbered lists, and tables** where necessary.  
✅ Always format **code snippets** correctly.  
✅ Ensure proper **spacing and section separation** for readability.  
✅ Keep responses **concise (max 500 words)** unless explicitly asked for more details.  
✅ Use **horizontal rules (\`---\`)** to separate sections for clarity.  
✅ Maintain **clear section headings (\`h1\`, \`h2\`, \`h3\`)** based on content hierarchy.  
✅ Avoid unnecessary explanations in the **Head** section—keep it to the point.  

> **Important:** Never include literal section titles like "Head, Body, Trunk" in the response—structure the answer naturally following this format.  

---
`,
      prompt: `Chat history: ${formattedHistory}`,
    }).stream;

    for await (const chunk of aiResponseStream) {
      const cleanedChunk = chunk.text;

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

app.post("/generate-title", async (req, res) => {
  const { history } = req.body;

  const formattedHistory = history
    .map(({ role, text }) => `${role === "user" ? "User" : "AI"}: ${text}`)
    .join("\n");

  try {
    const r = await ai.generate({
      system: `You are given chat history, you are tasked to generate a title for the chat based on the discussion in chat. The title should be 5-15 words in length.`,
      prompt: `Chat history: ${formattedHistory}`,
    });

    const title = r.text.trim(); // Extract the generated title and trim any extra whitespace

    console.log("TITLE: ", title);

    res.status(200).json({ title: title }); // Send the title as a JSON response with a 200 OK status
  } catch (error) {
    console.error("Error generating title:", error);
    res.status(500).json({ error: "Failed to generate title" }); // Send an error response with a 500 Internal Server Error status
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
