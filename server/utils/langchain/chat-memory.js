import { BufferMemory, ChatMessageHistory } from "langchain/memory";

const chatMemories = new Map();

export async function getMemoryForChat(chatId, history) {
    if (!chatMemories.has(chatId)) {
        const messageHistory = new ChatMessageHistory();

        for (const msg of history) {
            await messageHistory.addMessage({ role: msg.role, content: msg.text });
        }

        const memory = new BufferMemory({
            returnMessages: true,
            memoryKey: "history",
            chatHistory: messageHistory
        })

        chatMemories.set(chatId, memory);
    }

    return chatMemories.get(chatId);
}
