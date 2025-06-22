import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRAGPromptTemplate } from "../prompts.util.js";

export async function createRAGChain(model, retriever, userDetails, chatHistory, lastPrompt) {
  const ragPrompt = createRAGPromptTemplate();
  const documentChain = await createStuffDocumentsChain({ llm: model, prompt: ragPrompt });


  return RunnableSequence.from([
    {
      question: async () => lastPrompt,
      context: async () => {
        // Handle case when retriever is null (no documents available)
        if (!retriever) {
          return []; // Return empty array when no retriever available
        }
        try {
          return await retriever.getRelevantDocuments(lastPrompt);
        } catch (error) {
          console.error("Error retrieving documents:", error);
          return []; // Return empty array on error
        }
      },
      chatHistory: async () => chatHistory,
      userDetails: async () => userDetails
    },
    documentChain,
    new StringOutputParser(),
  ]);
}
