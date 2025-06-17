// import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
// import { RunnableSequence } from "@langchain/core/runnables";
import { SarvamAI } from "./llms/custom/sarvam.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv"
dotenv.config()


const searchTool = {
  googleSearch: {},
};

const tools = [searchTool];

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  maxOutputTokens: 2048,
  streaming: true,
});

const modelWithTools = model.bindTools(tools);


const res = await modelWithTools.invoke("What is the weather today in nagpur?");

console.log(res)

// for await (const chunk of res) {
//   console.log(chunk); // This will include "thinking" steps if prompted
// }


