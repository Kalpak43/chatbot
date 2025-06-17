import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const documentStores = new Map();

export async function getDocumentStoreForChat(chatId) {
    if (!documentStores.has(chatId)) {
        const embeddings = new GoogleGenerativeAIEmbeddings({ modelName: "embedding-001" });
        const store = await QdrantVectorStore.fromTexts([], [], embeddings, {
            collectionName: chatId,
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
        });
        documentStores.set(chatId, store);
    }

    return documentStores.get(chatId);
}
