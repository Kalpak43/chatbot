import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { fileTypeFromBlob } from "file-type";
import { getDocumentStoreForChat } from "./vector-store.js";

export async function detectFileType(blob, url) {
    const type = await fileTypeFromBlob(blob);
    if (type?.ext) return type.ext;

    // Fallback from URL
    return url.split(".").pop()?.split("?")[0] || "txt";
}

export async function processTextFile(blob, chatId, ext) {
    let loader;
    if (ext === "pdf") loader = new PDFLoader(blob);
    else if (ext === "docx") loader = new DocxLoader(blob);
    else loader = new TextLoader(blob);

    const docs = await loader.load();
    docs.forEach((doc) => {
        doc.metadata = {
            source: "file",
            type: ext,
            fileName: blob.name || "unknown",
        };
    });

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    const store = await getDocumentStoreForChat(chatId);
    await store.addDocuments(splitDocs);
}

export async function processImage(blob, chatId) {
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const imageData = {
        type: "image_url",
        image_url: `data:${blob.type};base64,${base64}`,
    };

    const model = new ChatGoogleGenerativeAI({ model: "gemini-2.0-flash" });
    const response = await model.invoke([
        new SystemMessage("Describe this image."),
        new HumanMessage({ content: [imageData] }),
    ]);

    const description = response.content;
    const doc = {
        pageContent: `[Image Description: ${description}]`,
        metadata: { source: "image_description", type: "image" },
    };

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments([doc]);
    const store = await getDocumentStoreForChat(chatId);
    await store.addDocuments(splitDocs);
}
