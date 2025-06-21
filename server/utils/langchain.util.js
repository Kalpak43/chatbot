import { detectFileType, processTextFile, processImage } from "./langchain/file-processor.js";
import { getMemoryForChat } from "./langchain/chat-memory.js";
import { getDocumentStoreForChat } from "./langchain/vector-store.js";
import { createRAGChain } from "./langchain/runner.js";
import { llms } from "./llms.util.js";

import dotenv from "dotenv"
dotenv.config()


const searchTool = {
  googleSearch: {},
};

const tools = [searchTool];

export const setupLangChain = async (history, chatId, llmModel, useWeb = false) => {
  let model = llms[llmModel] || llms["sarvam-ai"];
  if (useWeb)
    model = model.bindTools(tools);

  const memory = await getMemoryForChat(chatId, history);
  const lastMessage = history[history.length - 1];
  const { attachments = [] } = lastMessage;

  for (const attachment of attachments) {
    try {
      const res = await fetch(attachment.url);
      const blob = await res.blob();
      const contentType = res.headers.get("content-type");
      const ext = await detectFileType(blob, attachment.url);

      if (contentType.startsWith("image/")) {
        await processImage(blob, chatId);
      } else {
        await processTextFile(blob, chatId, ext);
      }
    } catch (e) {
      console.error("File processing failed:", e);
    }
  }

  const retriever = (await getDocumentStoreForChat(chatId)).asRetriever({ k: 20 });
  const chatHistory = (await memory.loadMemoryVariables({})).history || [];

  const formattedHistory = chatHistory.map((msg) =>
    `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`
  ).join("\n");

  const ragChain = await createRAGChain(model, retriever, formattedHistory, lastMessage.text);
  return {
    memory,
    streamable: await ragChain.stream(),
  };
};

