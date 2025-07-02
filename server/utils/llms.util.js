import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SarvamAI } from "../llms/custom/sarvam.js";

export const llms = {
    "gemini-2.5-flash-lite": new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash-lite-preview-06-17",
        maxOutputTokens: 2048,
        streaming: true,
    }),
    "gemini-2.0-flash": new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        maxOutputTokens: 4096,
        streaming: true,
    }),
    "gemini-2.5-flash": new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        maxOutputTokens: 4096,
        streaming: true,
    }),
    "gemini-2.5-flash": new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        maxOutputTokens: 4096,
        streaming: true,
    }),
    "gemini-2.5-pro": new ChatGoogleGenerativeAI({
        model: "gemini-2.5-pro",
        maxOutputTokens: 4096,
        streaming: true,
    }),
    "sarvam-ai": new SarvamAI({ model: "sarvam-ai", maxOutputTokens: 4096, stream: true }),
    "sarvam-ai-thinker": new SarvamAI({ model: "sarvam-ai-thinker", maxOutputTokens: 8192, stream: true }),
}