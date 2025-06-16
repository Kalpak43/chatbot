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
