import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const models = {
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
    })
}