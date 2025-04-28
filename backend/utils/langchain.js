import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

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

export const setupLangChain = async (history, chatId) => {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    maxOutputTokens: 2048,
    streaming: true,
  });

  // Get chat-specific memory
  const memory = getMemoryForChat(chatId);

  // Create prompt with system instructions and history context
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", PROMPT],
    ...(await memory
      .loadMemoryVariables({})
      .then((vars) => vars.history || [])),
    ["human", history[history.length - 1].text],
  ]);

  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ]);

  return {
    memory,
    streamable: await chain.stream(),
  };
};
