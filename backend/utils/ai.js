const { gemini20Flash, googleAI } = require("@genkit-ai/googleai");
const { genkit } = require("genkit");

const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

const PROMPT = `AI Chatbot Response Format  
  
  Your responses must be contain 3 main sections:  
  
  ### **Structure**  
  
  #### [title for section 1]  
  - Provide a **concise** and **direct** answer to the user's question.  
  - Summarize the key point without unnecessary context.  
  - Ensure clarity and accuracy in a single paragraph or a few bullet points.  
  
  ####  [title for section 2] 
  - Explain the answer in **well-structured sub-sections with clear headings**.  
  - Use **bullet points or numbered lists** for better readability.  
  - Where applicable, include:  
    - **Tables** for data representation.  
    - **Formulas** for mathematical or scientific topics.  
    - **Code blocks** for programming-related content.  
  - Keep explanations **structured, well-organized, and easy to understand**.  
  
  ####  [title for section 2]   
  - Summarize key takeaways from the explanation.  
  - Provide **next steps, best practices, or alternative approaches**.  
  - Suggest **further reading, tools, or considerations** based on the topic.  
  
  ---
  
  ### **Formatting Guidelines**  
  ✅ Use **bullet points, numbered lists, and tables** where necessary.  
  ✅ Always format **code snippets** correctly.  
  ✅ Ensure proper **spacing and section separation** for readability.  
  ✅ Keep responses **concise (max 500 words)** unless explicitly asked for more details.  
  ✅ Use **horizontal rules (\`---\`)** to separate sections for clarity.  
  ✅ Maintain **clear section headings (\`h1\`, \`h2\`, \`h3\`)** based on content hierarchy.  
  ✅ Avoid unnecessary explanations in the **Head** section—keep it to the point.  
  
  > **Important:** Never include literal section titles like "Head, Body, Trunk" in the response—structure the answer naturally following this format.  
  
  ---
  `;

const createResponseStream = (history) => {
  // Convert chat history into a string
  const formattedHistory = history
    .map(({ role, text }) => `${role === "user" ? "User" : "AI"}: ${text}`)
    .join("\n");

  const aiResponseStream = ai.generateStream({
    system: PROMPT,
    prompt: `Chat history: ${formattedHistory}`,
  }).stream;

  return aiResponseStream;
};

const generateTitle = async (history) => {
  const formattedHistory = history
    .map(({ role, text }) => `${role === "user" ? "User" : "AI"}: ${text}`)
    .join("\n");

  try {
    const r = await ai.generate({
      system: `You are given chat history, you are tasked to generate a title for the chat based on the discussion in chat. The title should be 5-15 words in length.`,
      prompt: `Chat history: ${formattedHistory}`,
    });

    const title = r.text.trim(); // Extract the generated title and trim any extra whitespace

    return title; // Send the title as a JSON response with a 200 OK status
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = { createResponseStream, generateTitle };
