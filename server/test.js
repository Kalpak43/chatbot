import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
import { RunnableSequence } from "@langchain/core/runnables";
import { SarvamAI } from "./llms/custom/sarvam.js";
import dotenv from "dotenv"
dotenv.config()

const model = new SarvamAI({ apiKey: process.env.SARVAM_API_KEY, stream: true });

const stream = await model.stream("What is capital of India?")

for await (const chunk of stream) {
    console.log(chunk);
}