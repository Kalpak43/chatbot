import dotenv from "dotenv";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

import { BufferMemory } from "langchain/memory";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { fileTypeFromBlob } from "file-type";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
// import { Chroma } from "@langchain/community/vectorstores/chroma";
import { QdrantVectorStore } from "@langchain/qdrant";
import { createRAGPromptTemplate } from "./prompts.util.js";

dotenv.config();

console.log(process.env.CHROMADB_URI);

const chatMemories = new Map();

const getMemoryForChat = (chatId) => {
  if (!chatMemories.has(chatId)) {
    chatMemories.set(
      chatId,
      new BufferMemory({
        returnMessages: true,
        memoryKey: "history",
      })
    );
  }

  return chatMemories.get(chatId);
};

// Vector stores for document retrieval
const documentStores = new Map();

// Get or create document store for a specific chat
const getDocumentStoreForChat = async (chatId) => {
  if (!documentStores.has(chatId)) {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "embedding-001",
    });

    // const chromaStore = await Chroma.fromTexts([], [], embeddings, {
    //   collectionName: chatId,
    //   url: process.env.CHROMADB_URI,
    // });

    const qdrantStore = await QdrantVectorStore.fromTexts([], [], embeddings, {
      collectionName: chatId,
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    documentStores.set(chatId, qdrantStore);
  }

  return documentStores.get(chatId);
};

// Function to process text files and add to vector store
async function processTextFile(fileBlob, chatId, ext) {
  let loader;

  try {
    if (ext === "pdf") {
      loader = new PDFLoader(fileBlob);
    } else if (ext === "docx") {
      loader = new DocxLoader(fileBlob);
    } else {
      // Default to text loader for .txt and other text formats
      loader = new TextLoader(fileBlob);
    }

    const docs = await loader.load();

    // Add metadata to identify the source file
    docs.forEach((doc) => {
      doc.metadata = {
        source: "File Content",
        type: "pdf",
        blobType: "application/pdf",
        fileName: fileBlob.name || "unknown",
      };
    });

    // Split text into manageable chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    // Add to vector store
    const vectorStore = await getDocumentStoreForChat(chatId);
    await vectorStore.addDocuments(splitDocs);
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error("Failed to process the file.");
  }
}

async function processImage(imageBlob, chatId, ext) {
  const arrayBuffer = await imageBlob.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");
  const base64Data = `data:${imageBlob.type};base64,${base64String}`;

  const imageData = {
    type: "image_url",
    image_url: base64Data,
  };

  const descriptionModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
  });

  const response = await descriptionModel.invoke([
    new SystemMessage("Generate a detailed description of this image."),
    new HumanMessage({
      content: [imageData],
    }),
  ]);

  const imageDescription = response.content;

  console.log("Image Description:", imageDescription);

  // Add description to vector store
  const vectorStore = await getDocumentStoreForChat(chatId);
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const doc = {
    pageContent: `[Image Description: ${imageDescription}]`,
    metadata: { source: "image_description", type: "image" },
  };

  const splitDocs = await textSplitter.splitDocuments([doc]);
  console.log("Split Documents:", splitDocs);

  await vectorStore.addDocuments(splitDocs);

  console.log("Documents added to vector store:", splitDocs.length);
  console.log("Vector store updated for chat ID:", chatId);
}

export const setupLangChain = async (history, chatId) => {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    // maxOutputTokens: 2048,
    streaming: true,
  });

  // Get chat-specific memory
  const memory = getMemoryForChat(chatId);

  console.log(memory);

  const lastMessage = history[history.length - 1];
  const { attachments } = lastMessage;

  // Process any attached files
  let fileProcessingMessages = [];

  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      try {
        const response = await fetch(attachment.url);
        const contentType = response.headers.get("content-type");
        const fileBlob = await response.blob();

        console.log("CONTENT DATA: ", contentType);

        const fileType = await fileTypeFromBlob(fileBlob);
        let ext = "plain";

        if (fileType) {
          ext = fileType.ext;
        } else {
          ext = attachment.url.split(".").pop()?.split("?")[0] || "txt";
        }
        // const filename = uuidv4();
        // const filePath = path.join(__dirname, "uploads", filename + "." + ext);
        // await fs.writeFile(filePath, buffer);

        if (contentType.startsWith("image/")) {
          const result = await processImage(fileBlob, chatId, ext);
          fileProcessingMessages.push(result);
        } else {
          const result = await processTextFile(fileBlob, chatId, ext);
          fileProcessingMessages.push(result);
        }
      } catch (err) {
        console.error("Attachment processing failed:", err);
      }
    }
  }

  // Get document store and perform similarity search
  const vectorStore = await getDocumentStoreForChat(chatId);

  const ragPrompt = createRAGPromptTemplate();

  const documentChain = await createStuffDocumentsChain({
    llm: model,
    prompt: ragPrompt,
  });

  const retriever = vectorStore.asRetriever({
    k: 5,
    searchType: "similarity",
    filter: null,
    scoreThreshold: 0.5,
    maxConcurrency: 5,
  });

  // Chat history context
  const chatHistory = await memory
    .loadMemoryVariables({})
    .then((vars) => vars.history || [])
    .then((history) =>
      history
        .map((msg) => {
          return `${msg.role === "user" ? "Human" : "Assistant"}: ${
            msg.content
          }`;
        })
        .join("\n")
    );

  const ragChain = RunnableSequence.from([
    {
      question: async () => lastMessage.text,
      context: async () => {
        const docs = await retriever.getRelevantDocuments(lastMessage.text);
        return docs;
      },
      chatHistory: async () => chatHistory,
    },
    documentChain,
    new StringOutputParser(),
  ]);

  return {
    memory,
    streamable: await ragChain.stream(),
  };
};
