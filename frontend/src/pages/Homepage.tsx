import { cleanMarkdown } from "../utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "../styles/chatStyles.css";
import Markdown from "../components/Markdown";
import { useEffect } from "react";
import { markdownRegex } from "../data/markdown";

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
1. Hi
2. Hello
  1. Hello 2.1
  2. Hello 2.2
`;

  useEffect(() => {
    console.log(markdownRegex["ol"].exp.test(res));
  }, []);

  return (
    <div className="relative h-full overflow-y-auto">
      {/* <ReactMarkdown>{markdownContent}</ReactMarkdown> */}
      <Markdown>{res}</Markdown>
    </div>
  );
}

export default Homepage;
