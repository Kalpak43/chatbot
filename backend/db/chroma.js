import dotenv from "dotenv";

import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

dotenv.config();

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
});

const vectorStore = new Chroma(embeddings, {
  collectionName: "test-collection",
  url: "http://localhost:8000",
  collectionMetadata: {
    "hnsw:space": "cosine",
  },
});

const document1 = {
  pageContent: "The powerhouse of the cell is the mitochondria",
  metadata: { source: "https://example.com" },
};

const document2 = {
  pageContent: "Buildings are made out of brick",
  metadata: { source: "https://example.com" },
};

const document3 = {
  pageContent: "Mitochondria are made out of lipids",
  metadata: { source: "https://example.com" },
};

const document4 = {
  pageContent: "The 2024 Olympics are in Paris",
  metadata: { source: "https://example.com" },
};

const documents = [document1, document2, document3, document4];

await vectorStore.addDocuments(documents, { ids: ["1", "2", "3", "4"] });

const filter = { source: "https://example.com" };

// const similaritySearchResults = await vectorStore.similaritySearch(
//   "biology",
//   2,
//   filter
// );

// for (const doc of similaritySearchResults) {
//   console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
// }

const retriever = vectorStore.asRetriever({
  // Optional filter
  filter: filter,
  k: 2,
});
console.log(await retriever.invoke("biology"));
