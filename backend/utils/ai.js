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

const createParts = async (history) => {
  const finalPromptParts = [];

  let lastMessage = history[history.length - 1];
  history = history.slice(0, -1); // Remove the last message

  history.forEach(({ role, text }) => {
    finalPromptParts.push({
      text: `${role === "user" ? "User" : "AI"}: ${text}`,
    });
  });

  finalPromptParts.push({
    text: `${lastMessage.role === "user" ? "User" : "AI"}: ${lastMessage.text}`,
  });

  return finalPromptParts;
};

const createResponseStream = (history) => {
  const aiResponseStream = ai.generateStream({
    system: PROMPT,
    prompt: history,
  }).stream;

  return aiResponseStream;
};

const generateTitle = async (history) => {
  const formattedHistory = history
    .map(({ role, text }) => `${role === "user" ? "User" : "AI"}: ${text}`)
    .join("\n");

  try {
    const r = await ai.generate({
      system: `You are given chat history, you are tasked to generate a title for the chat based on the discussion in chat. The title should be 5-10 words in length.`,
      prompt: `Chat history: ${formattedHistory}`,
    });

    const title = r.text.trim(); // Extract the generated title and trim any extra whitespace

    return title; // Send the title as a JSON response with a 200 OK status
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = {
  createResponseStream,
  generateTitle,
  createParts,
};





// const { attachments } = lastMessage;

// if (attachments && attachments.length > 0) {
//   for (const attachment of attachments) {
//     try {
//       const response = await fetch(attachment.url);
//       const contentType = response.headers.get("content-type");
//       const arrayBuffer = await response.arrayBuffer();

//       // Supported media types
//       const supportedMediaTypes = [
//         "image/png",
//         "image/jpeg",
//         "image/jpg",
//         "image/webp",
//         "application/pdf",
//       ];

//       if (supportedMediaTypes.includes(contentType)) {
//         const base64String = Buffer.from(arrayBuffer).toString("base64");

//         finalPromptParts.push({
//           media: {
//             url: `data:${contentType};base64,${base64String}`,
//             contentType: contentType,
//           },
//         });
//       } else {
//         // Convert non-supported media types into text
//         const textContent = Buffer.from(arrayBuffer).toString("utf-8");

//         finalPromptParts.push({
//           text: `User uploaded a file (${
//             attachment.name || "file"
//           }):\n\n${textContent}`,
//         });
//       }
//     } catch (error) {
//       console.error("Error processing attachment:", error);
//     }
//   }
// }