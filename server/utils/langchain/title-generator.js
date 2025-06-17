import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as z from "zod"

export const generateTitle = async (chatHistory) => {
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash-lite",
        maxOutputTokens: 1024,
        streaming: true,
    });

    const titleSchema = z.object({
        title: z.string().describe("A concise title for the conversation")
    });

    const structuredModel = model.withStructuredOutput(titleSchema);

    const messages = chatHistory.map((item) => {
        if (item.role === "user") {
            return new HumanMessage(item.text);
        } else if (item.role === "ai") {
            return new AIMessage(item.text);
        }
    });


    const prompt = await TITLE_PROMPT.formatMessages({
        chat_history: messages,
    });

    const response = await structuredModel.invoke(prompt);

    return response.title;
};