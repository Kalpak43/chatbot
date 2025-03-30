import { cleanMarkdown } from "../utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "../styles/chatStyles.css";
import Markdown from "../components/Markdown";

const markdownContent = `
# The Future of Web Development 🚀

Web development is evolving rapidly, with new technologies and frameworks emerging every year. In this article, we will explore some of the key trends shaping the future of web development.

## 🌟 The Rise of JavaScript Frameworks

> "JavaScript is eating the world." - Marc Andreessen

JavaScript frameworks like **React**, **Vue**, and **Svelte** are becoming more powerful and user-friendly. These frameworks help developers build dynamic, high-performance applications with minimal effort.

## ⚡ Serverless Architecture

Serverless computing is revolutionizing the way developers deploy applications. With platforms like **Vercel**, **Netlify**, and **AWS Lambda**, developers can focus on writing code while the cloud handles the infrastructure.

### 🔥 Benefits of Serverless:
- **Scalability**: Automatically adjusts to traffic spikes.
- **Cost-effective**: Pay only for what you use.
- **Reduced maintenance**: No need to manage servers.

## 🎨 The Power of UI/UX Design

Great UI/UX design is crucial for user engagement. **Minimalistic design, micro-interactions, and dark mode** are some of the trends gaining popularity.

#### **Key UI Trends:**
- *Glassmorphism & Neumorphism* 🎨  
- **AI-powered design tools** 🤖  
- *Voice and gesture-based UI* 🎙️  

## 🤖 The Role of AI in Web Development

AI is transforming the web development space with tools like **GitHub Copilot** and **ChatGPT**. AI-powered chatbots, automated testing, and content generation are becoming essential in modern web apps.

## 🚀 Final Thoughts

Web development is an ever-changing field. Staying updated with the latest trends, experimenting with new technologies, and continuously learning will help you stay ahead in the game.

---

**What are your thoughts on the future of web development? Let’s discuss in the comments!** 💬
`;

function Homepage() {
  const res = `
Okay, here's a list of good questions to ask an AI, formatted to be as helpful as possible:

### **Types of Questions**

Here's a breakdown of question types you can ask, along with examples:

* **Creative/Generative:**
  * "Write a short story about a cat who becomes a detective."
  * "Compose a haiku about the feeling of autumn."
  * "Create a marketing slogan for a new brand of coffee."

*   **Informational/Factual:**

    *   "Explain the theory of relativity."

    *   "What are the main causes of climate change?"

    *   "Who won the Nobel Prize in Literature in 2020?"

*   **Problem-Solving/Analytical:**

    *   "How can I improve my time management skills?"

    *   "What are the pros and cons of remote work?"

    *   "Suggest a healthy meal plan for a week."

*   **Comparative/Evaluative:**

    *   "Compare and contrast Python and Java."

    *   "What are the advantages of using cloud storage over local storage?"

    *   "Which is better for gaming, a desktop or a laptop?"

*   **Hypothetical/Speculative:**

    *   "What would happen if the internet suddenly disappeared?"

    *   "How might artificial intelligence impact society in 50 years?"

    *   "If you could travel to any point in history, where would you go and why?"

*   **Personalized/Advisory:**

    *   "What are some good books to read based on my interest in science fiction?"

    *   "I'm feeling stressed. What are some relaxation techniques I can try?"

    *   "Recommend a travel destination for a family with young children."

*   **Coding/Technical:**

    *   "Write a Python function to sort a list of numbers."

    *   "How do I debug a 'segmentation fault' error in C++?"

    *   "Explain the concept of object-oriented programming."

*   **Ethical/Philosophical:**

    *   "Is it ethical to use AI to create deepfakes?"

    *   "What is the meaning of life?"

    *   "Should autonomous vehicles be programmed to prioritize the safety of their passengers or pedestrians in an accident?"

`;

  return (
    <div className="relative h-full overflow-y-auto">
      {/* <ReactMarkdown>{markdownContent}</ReactMarkdown> */}
      <Markdown>{res}</Markdown>
    </div>
  );
}

export default Homepage;
