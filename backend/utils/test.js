// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// const response = await fetch(
//   "https://firebasestorage.googleapis.com/v0/b/chatbot-1234d.firebasestorage.app/o/uploads%2FcFEf7SBUE7RB3Mi5wngDXJ77ub62%2FCopy%20of%20Cardiac%20MRI_research%20.docx.pdf?alt=media&token=fe3770ff-be95-4435-998c-0ce14332fb65"
// );

// const blob = await response.blob();

// const loader = new PDFLoader(blob, {
//   splitPages: true,
//   splitMetadata: true,
//   metadataTemplate: {
//     title: "Cardiac MRI",
//   },
// });

// const docs = await loader.load();

// console.log(docs);
import dotenv from "dotenv";
dotenv.config();

import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import axios from "axios";

// Vector stores for document retrieval
const documentStores = new Map();

// Get or create document store for a specific chat
const getDocumentStoreForChat = async (chatId) => {
  if (!documentStores.has(chatId)) {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "embedding-001",
    });

    documentStores.set(
      chatId,
      await MemoryVectorStore.fromTexts([], [], embeddings)
    );
  }

  return documentStores.get(chatId);
};

async function processImage(imageBlob, chatId) {
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

const response = await fetch(
  "https://firebasestorage.googleapis.com/v0/b/chatbot-1234d.firebasestorage.app/o/uploads%2FcFEf7SBUE7RB3Mi5wngDXJ77ub62%2FRectangle%2012363%20(4).png?alt=media&token=0c2c2f35-2b29-4d2e-bb5c-3ab3c1938509"
);

const blob = await response.blob();

processImage(blob, "test-chat-id");
