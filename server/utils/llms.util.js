import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SarvamAI } from "../llms/custom/sarvam.js";

export const llms = {
    "gemini-2.0-flash": new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        maxOutputTokens: 2048,
        streaming: true,
    }),
    "gemini-2.5-flash": new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash-preview-05-20",
        maxOutputTokens: 2048,
        streaming: true,
    }),
    "gemini-2.5-pro": new ChatGoogleGenerativeAI({
        model: "gemini-2.5-pro-preview-06-05",
        maxOutputTokens: 2048,
        streaming: true,
    }),
    "sarvam-ai": new SarvamAI({ apiKey: process.env.SARVAM_API_KEY, stream: true })
}