const { gemini20Flash, googleAI } = require("@genkit-ai/googleai");
const { genkit } = require("genkit");

const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

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
