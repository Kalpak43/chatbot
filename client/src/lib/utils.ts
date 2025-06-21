import db from "@/dexie";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function createHistory({
  chatId,
  messageId,
}: {
  chatId: string;
  messageId: string;
}): Promise<ChatHistory[]> {
  // Get the reference message to find its createdAt timestamp
  const refMessage = await db.messages.get(messageId);
  if (!refMessage) return [];

  const messages = await db.messages
    .where("chatId")
    .equals(chatId)
    .filter(
      (message) =>
        message.status !== "deleted" &&
        message.created_at <= refMessage.created_at
    )
    .toArray();

  return messages
    .sort((a, b) => a.created_at - b.created_at)
    .map((message) => ({
      role: message.role,
      text: message.text,
      attachments: message.attachments,
    }));
}

import { createHighlighter } from "shiki";

export async function codeHighlighter(
  code: string,
  language: string,
  theme: "light" | "dark"
) {
  if (!code || !code.trim()) return "";

  const hl = await createHighlighter({
    themes: ["github-dark", "github-light"],
    langs: [
      "javascript",
      "typescript",
      "python",
      "java",
      "cpp",
      "html",
      "css",
      "json",
      "markdown",
      "bash",
      "sql",
      "go",
      // Add more languages as needed
    ],
  });

  if (!hl) return code;

  let highlightedCode = "";

  try {
    highlightedCode = hl.codeToHtml(code, {
      lang: language,
      theme: theme == "dark" ? "github-dark" : "github-light", // You can make this dynamic based on theme
    });
  } catch {
    highlightedCode = `<pre><code>${code}</code></pre>`;
  }

  return highlightedCode;
}
