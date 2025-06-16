// import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
// import { RunnableSequence } from "@langchain/core/runnables";
import { SarvamAI } from "./llms/custom/sarvam.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv"
dotenv.config()

const model = new SarvamAI({ apiKey: process.env.SARVAM_API_KEY, stream: true });

// const stream = await model.stream("What is capital of India?")

// for await (const chunk of stream) {
//     console.log(chunk);
// }

// const model = new ChatGoogleGenerativeAI({
//   model: "gemini-2.5-pro-preview-06-05",
//   maxOutputTokens: 2048,
//   streaming: true,
// });

const res = await model.stream("What is AI");

for await (const chunk of res) {
  console.log(chunk); // This will include "thinking" steps if prompted
}