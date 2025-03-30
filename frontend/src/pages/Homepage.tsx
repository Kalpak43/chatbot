import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useCallback, useEffect, useState } from "react";
import { SendHorizontal } from "lucide-react";
// import { appendMessageContent, getMessages } from "../db";
import { liveQuery } from "dexie";
import { cleanMarkdown, getTitle, sendPrompt } from "../utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "../styles/chatStyles.css";
import Markdown from "../components/Markdown";
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
  const res =
    "JavaScript frameworks like **React**, **Vue**, and **Svelte** are becoming more powerful and user-friendly. These frameworks help developers build dynamic, high-performance applications with minimal effort.";

  useEffect(() => {
    console.log(res.split(markdownRegex["**"].split!));
  }, []);

  return (
    <div className="relative h-full overflow-y-auto">
      <ReactMarkdown>{markdownContent}</ReactMarkdown>
      {/* <Markdown>{markdownContent}</Markdown> */}
    </div>
  );
}

export default Homepage;

export function UserBubble({ msg }: { msg: string }) {
  return (
    <div className="chat chat-end">
      <div className="chat-bubble chat-bubble-primary  text-white">{msg}</div>
    </div>
  );
}

export function AIBubble({ msg }: { msg: string }) {
  return (
    <div className="chat ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-500 italic pl-3">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a href={href} className="text-primary underline">
                {children}
              </a>
            );
          },
          ul({ children }) {
            return <ul className="list-disc ml-4">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal ml-4">{children}</ol>;
          },
          h1({ children }) {
            return (
              <h1 className="text-4xl font-bold text-primary">{children}</h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-3xl font-semibold text-secondary">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-2xl font-medium text-accent">{children}</h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-xl font-medium  text-info">{children}</h4>
            );
          },
          h5({ children }) {
            return (
              <h5 className="text-lg font-normal text-base-content">
                {children}
              </h5>
            );
          },
          h6({ children }) {
            return (
              <h6 className="text-md font-light text-base-content/80">
                {children}
              </h6>
            );
          },
        }}
      >
        {cleanMarkdown(msg)}
      </ReactMarkdown>
    </div>
  );
}
