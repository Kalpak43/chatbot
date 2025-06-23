import { auth } from "@/firebase";
import axios from "axios";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL;

export const sendPrompt = async ({
  chatHistory,
  model,
  webSearch,
  onMessage,
  onStart,
  onEnd,
  onError,
  uid,
  id,
  signal,
  onRateLimitUpdate,
}: {
  chatHistory: ChatHistory[];
  model: string;
  webSearch: boolean;
  onMessage: (msg: string) => Promise<void>;
  onStart: () => Promise<void>;
  onEnd: () => Promise<void>;
  onError: (error: unknown) => void;
  onRateLimitUpdate?: (info: {
    limit: string | null;
    remaining: string | null;
    reset: string | null;
  }) => void;
  uid?: string;
  id?: string;
  signal?: AbortSignal;
}) => {
  try {
    let lock = 0;
    const idToken = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        history: chatHistory,
        id,
        uid,
        model,
        web_search: webSearch,
      }),
      signal,
    });

    if (!response.ok) {
      console.error("Error:", response.statusText);
      onError(response.statusText);
      return;
    }

    const limit = response.headers.get("Ratelimit-Limit");
    const remaining = response.headers.get("Ratelimit-Remaining");
    const reset = response.headers.get("Ratelimit-Reset");

    if (limit !== null) localStorage.setItem("Ratelimit-Limit", limit);
    if (remaining !== null)
      localStorage.setItem("Ratelimit-Remaining", remaining);
    if (reset !== null) localStorage.setItem("Ratelimit-Reset", reset);

    onRateLimitUpdate?.({ limit, remaining, reset });

    if(Number(remaining) == 0) {
      toast.info("You have reached the limit")
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      console.error("Response body reader is null");
      onError("Response body reader is null");
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });

      // Use for...of loop to correctly await each line's processing
      for (const line of chunk.split("\n")) {
        if (line.startsWith("msg: ")) {
          try {
            if (!lock) {
              await onStart();
              lock = 1;
            }
            const parsedData = JSON.parse(line.replace("msg: ", ""));
            // await new Promise((resolve) => setTimeout(resolve, 1));
            await onMessage(parsedData);
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            onError(parseError);
          }
        }
      }
    }

    await onEnd(); // This will now correctly wait for all messages to be processed
  } catch (error) {
    console.error("Streaming error:", error);
    onError(error);
  }
};

export async function getTitle(chatHistory: MessageType[]) {
  const res = await axios.post(`${API_URL}/api/chat/generate-title`, {
    chatHistory,
  });

  if (res.data.title) return res.data.title;

  return "";
}

export async function checkLimit() {
  const idToken = await auth.currentUser?.getIdToken();
  const response = await axios.get(`${API_URL}/api/check-limit`, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  console.log(response.data);
}
