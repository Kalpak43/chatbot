import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkLint from "remark-lint";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Check, Copy } from "lucide-react";

import "../styles/chatStyles.css";
import { marked } from "marked";

function Testpage() {
  const md = "###**Head**Go uses `if`, `else if`, and `else`";

  const [fromatted, setFormatted] = useState("");

  const processMarkdown = async (text: string) => {
    const processed = await unified()
      .use(remarkParse) // Parses Markdown
      .use(remarkLint) // Detects syntax issues
      .use(remarkStringify) // Converts back to Markdown
      .process(text);

    return processed.toString();
  };

  useEffect(() => {
    const func = async () => setFormatted(await processMarkdown(md));

    func();
  }, []);

  function cleanMarkdown(markdown: string) {
    try {
      // Parse the markdown to ensure it's valid
      const parsed = marked.parse(markdown);
      return parsed;
    } catch (error) {
      console.error("Markdown parsing error:", error);
      // Fallback to a sanitized version or raw text
      return markdown.replace(/[<>]/g, ""); // Basic sanitization
    }
  }

  useEffect(() => {
    console.log(cleanMarkdown(md));
  }, []);

  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const [copied, setCopied] = useState(false);

            const handleCopy = (text: string) => {
              navigator.clipboard
                .writeText(text)
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                })
                .catch((err) => console.error("Failed to copy: ", err));
            };

            return match ? (
              <div className="relative">
                {/* Copy Button */}
                <button
                  onClick={() =>
                    handleCopy(String(children).replace(/\n$/, ""))
                  }
                  className="absolute top-2 right-2 btn btn-xs btn-ghost"
                >
                  {copied ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>

                {/* Code Block */}
                <SyntaxHighlighter
                  // @ts-ignore
                  style={dracula}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                  className="rounded-lg p-2"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-neutral p-1 rounded">{children}</code>
            );
          },
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
              <h4 className="text-2xl font-medium text-accent">{children}</h4>
            );
          },
        }}
      >
        {fromatted}
      </ReactMarkdown>
    </div>
  );
}

export default Testpage;
