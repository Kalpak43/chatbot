import dotenv from "dotenv";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

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
import { Chroma } from "@langchain/community/vectorstores/chroma";

dotenv.config();

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

// Vector stores for document retrieval
const documentStores = new Map();

// Get or create document store for a specific chat
const getDocumentStoreForChat = async (chatId) => {
  if (!documentStores.has(chatId)) {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "embedding-001",
    });

    const chromaStore = await Chroma.fromTexts([], [], embeddings, {
      collectionName: chatId,
      url: "http://localhost:8000",
    });

    documentStores.set(chatId, chromaStore);
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
    console.log("----------------------------------------------------");
    console.log("Split Documents:", splitDocs);
    console.log("----------------------------------------------------");

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

// Create the RAG prompt template
const createRAGPromptTemplate = () => {
  return ChatPromptTemplate.fromMessages([
    [
      "system",
      `${PROMPT}

You have access to the following documents/images. Use them to assist the user effectively.

{context}

For quiz or test questions:
1. Identify the question and all answer options
2. Apply your knowledge to determine the most likely correct answer
3. Explain your reasoning with confidence
4. If the question is from a specialized field and you're uncertain, make your best educated guess and explain your reasoning
      
For factual questions:
- If the documents don't contain enough information, use your knowledge to provide the most helpful response possible
- Only state that you don't know if the question requires very specific information that you genuinely cannot determine`,
    ],
    ["human", "{question}"],
  ]);
};

export const setupLangChain = async (history, chatId) => {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    // maxOutputTokens: 2048,
    streaming: true,
  });

  // Get chat-specific memory
  const memory = getMemoryForChat(chatId);

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

        const { ext } = await fileTypeFromBlob(fileBlob);
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
    k: 3,
    searchType: "similarity",
    filter: null,
    scoreThreshold: 0.7,
    maxConcurrency: 5,
  });

  // Chat history context
  const chatHistory = await memory
    .loadMemoryVariables({})
    .then((vars) => vars.history || [])
    .then((history) =>
      history
        .map(
          (msg) => `${msg.type === "user" ? "Human" : "Assistant"}: ${msg.text}`
        )
        .join("\n")
    );

  const ragChain = RunnableSequence.from([
    {
      question: async () => lastMessage.text,
      context: async (input) => {
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
