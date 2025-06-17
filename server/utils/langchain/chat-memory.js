import { BufferMemory } from "langchain/memory";

const chatMemories = new Map();

export function getMemoryForChat(chatId) {
    if (!chatMemories.has(chatId)) {
        chatMemories.set(chatId, new BufferMemory({
            returnMessages: true,
            memoryKey: "history",
        }));
    }

    return chatMemories.get(chatId);
}
