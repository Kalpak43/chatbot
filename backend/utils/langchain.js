import dotenv from "dotenv";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { BufferMemory } from "langchain/memory";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import fs from "fs/promises";
import path from "path";
import { fileTypeFromBuffer } from "file-type";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { v4 as uuidv4 } from "uuid";

import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

import { Annotation, StateGraph } from "@langchain/langgraph";

dotenv.config();

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
// Set __dirname to the project root (assumes this file is in a subdirectory)
const __dirname = path.resolve(path.dirname(__filename), "..");
console.log("Project root directory:", __dirname);

const PROMPT = `AI Chatbot Response Format  
  
  Organize all responses using the following three-part structure:

## Direct Answer
Provide a concise, direct answer to the user's question in 1-3 sentences or brief bullet points. Focus solely on addressing the core question without preamble.

## Detailed Explanation
Break down your explanation into logical sections with descriptive headings. Include:
- Well-structured bullet points or numbered lists
- Tables for comparing information when relevant
- Properly formatted code blocks for technical questions
- Formulas with clear notation for mathematical concepts
- Examples that illustrate key concepts

## Practical Application
- Summarize 2-3 key takeaways
- Suggest specific next steps or applications
- Recommend relevant resources, tools, or additional considerations

---

### Formatting Requirements
- Use markdown formatting consistently throughout
- Maintain clear hierarchy with appropriate heading levels
- Insert horizontal rules between major sections
- Limit total response to approximately 500 words unless more detail is requested
- Format all technical elements (code, formulas, tables) properly
- Use whitespace strategically for improved readability

*Note: Implement this structure naturally without explicitly mentioning the section names "Direct Answer," "Detailed Explanation," and "Practical Application" in your responses.*
  `;

// Memory store to maintain separate memory for each chat session
const chatMemories = new Map();

// Vector stores for document retrieval
const documentStores = new Map();

// Get or create memory for a specific chat
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

// Function to process text files and add to vector store
async function processTextFile(filePath, chatId, filename, ext) {
  let loader;

  try {
    if (ext === "pdf") {
      loader = new PDFLoader(filePath);
    } else if (ext === "docx") {
      loader = new DocxLoader(filePath);
    } else {
      // Default to text loader for .txt and other text formats
      loader = new TextLoader(filePath);
    }

    const docs = await loader.load();

    console.log(docs);

    // Add metadata to identify the source file
    docs.forEach((doc) => {
      doc.metadata.source = filename;
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

    console.log("Documents added to vector store:", splitDocs.length);
    console.log("Vector store updated for chat ID:", chatId);
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error("Failed to process the file.");
  }
}

// Function to determine if a file is an image
async function isImageFile(filePath) {
  const buffer = await fs.readFile(filePath);
  const fileType = await fileTypeFromBuffer(buffer);
  return fileType && fileType.mime.startsWith("image/");
}

// Create the RAG prompt template
const createRAGPromptTemplate = () => {
  return ChatPromptTemplate.fromMessages([
    [
      "system",
      `${PROMPT}

You have access to the following documents. Use them to answer the user's question.
    
{context}
    
If the documents don't contain the information needed to answer the question, be honest about what you don't know.`,
    ],
    ["human", "{question}"],
  ]);
};

export const setupLangChain = async (history, chatId) => {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    maxOutputTokens: 2048,
    streaming: true,
  });

  // Get chat-specific memory
  const memory = getMemoryForChat(chatId);

  const lastMessage = history[history.length - 1];
  const { attachments } = lastMessage;

  // Process any attached files
  let fileProcessingMessages = [];
  let imageFiles = [];

  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      try {
        const response = await fetch(attachment.url);
        const contentType = response.headers.get("content-type");
        const arrayBuffer = await response.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);

        const { ext } = await fileTypeFromBuffer(buffer);
        const filename = uuidv4();
        const filePath = path.join(__dirname, "uploads", filename + "." + ext);
        await fs.writeFile(filePath, buffer);

        console.log("File saved to:", filePath);
        console.log("File type detected:", ext);
        console.log("Content type:", contentType);

        if (await isImageFile(filePath)) {
          imageFiles.push(filePath);
        } else {
          const result = await processTextFile(filePath, chatId, filename, ext);
          fileProcessingMessages.push(result);
        }
      } catch (err) {
        console.error("Attachment processing failed:", err);
      }
    }
  }

  let promptMessages;

  if (imageFiles.length > 0) {
    const imageBuffers = await Promise.all(
      imageFiles.map(async (filePath) => {
        const fileData = await fs.readFile(filePath);
        const fileType = await fileTypeFromBuffer(fileData);

        // Format specifically for Google Generative AI
        return {
          type: "image_url", // This is the required type for image content
          image_url: {
            // For Google Gemini, we need to use base64 data URLs
            url: `data:${fileType.mime};base64,${fileData.toString("base64")}`,
          },
        };
      })
    );

    promptMessages = [
      new SystemMessage(PROMPT),
      ...(await memory
        .loadMemoryVariables({})
        .then((vars) => vars.history || [])),
      new HumanMessage({
        content: [{ type: "text", text: lastMessage.text }, ...imageBuffers],
      }),
    ];

    // Create prompt with system instructions and history context
    const prompt = ChatPromptTemplate.fromMessages(promptMessages);

    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    return {
      memory,
      streamable: await chain.stream(),
    };
  } else {
    // Get document store and perform similarity search
    const vectorStore = await getDocumentStoreForChat(chatId);

    if (vectorStore.memoryVectors.length === 0) {
      promptMessages = [
        new SystemMessage(PROMPT),
        ...(await memory
          .loadMemoryVariables({})
          .then((vars) => vars.history || [])),
        new HumanMessage({
          content: lastMessage.text,
        }),
      ];

      // Create prompt with system instructions and history context
      const prompt = ChatPromptTemplate.fromMessages(promptMessages);

      const chain = RunnableSequence.from([
        prompt,
        model,
        new StringOutputParser(),
      ]);

      return {
        memory,
        streamable: await chain.stream(),
      };
    } else {
      // Create prompt for RAG
      const ragPrompt = createRAGPromptTemplate();

      const documentChain = await createStuffDocumentsChain({
        llm: model,
        prompt: ragPrompt,
      });

      // Retrieve relevant documents (adjust the k value based on your needs)
      const retriever = vectorStore.asRetriever({ k: 5 });

      // Chat history context
      const chatHistory = await memory
        .loadMemoryVariables({})
        .then((vars) => vars.history || [])
        .then((history) =>
          history
            .map(
              (msg) =>
                `${msg.type === "user" ? "Human" : "Assistant"}: ${msg.text}`
            )
            .join("\n")
        );

      const ragChain = RunnableSequence.from([
        {
          question: async () => lastMessage.text,
          context: async (input) => {
            // Use the retriever instead of direct similarity search
            console.log(input);

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
    }
  }
};
