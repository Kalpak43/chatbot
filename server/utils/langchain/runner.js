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
      context: async () => retriever.getRelevantDocuments(lastPrompt),
      chatHistory: async () => chatHistory,
      userDetails: async () => userDetails
    },
    documentChain,
    new StringOutputParser(),
  ]);
}
