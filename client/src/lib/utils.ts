import db from "@/dexie";
import { auth } from "@/firebase";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const API_URL = import.meta.env.VITE_API_URL;

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

export async function getUserDetails() {
  let data = null,
    success = false;
  try {
    const idToken = await auth.currentUser?.getIdToken();

    const response = await axios.get(`${API_URL}/api/user/details`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (response.status != 200) throw new Error("No details available");

    data = response.data;
    success = true;
  } catch (e) {
    success = false;
  }

  return { data, success };
}

export async function saveUserDetails({
  name,
  role,
  extra,
}: {
  name: string;
  role: string;
  extra: string;
}) {
  let success = false;
  const idToken = await auth.currentUser?.getIdToken();

  try {
    const response = await axios.post(
      `${API_URL}/api/user/save-details`,
      {
        name,
        role,
        extra,
      },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (response.status != 200) throw new Error("Not able to save");

    success = true;
  } catch (error) {
    success = false;
  }

  return { success };
}
