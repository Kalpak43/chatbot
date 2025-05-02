import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const sendPrompt = async ({
  chatHistory,
  onMessage,
  onStart,
  onEnd,
  onError,
  uid,
  id,
  signal,
}: {
  chatHistory: {
    text: string;
    role: "user" | "ai";
    attachments?: Attachment[];
  }[];
  onMessage: (msg: string) => Promise<void>;
  onStart: () => Promise<void>;
  onEnd: () => Promise<void>;
  onError: (error: unknown) => void;
  uid?: string;
  id?: string;
  signal?: AbortSignal;
}) => {
  try {
    let lock = 0;
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: chatHistory,
        id,
        uid,
      }),
      signal,
    });

    if (!response.ok) {
      console.error("Error:", response.statusText);
      onError(response.statusText);
      return;
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
      chunk.split("\n").forEach(async (line) => {
        if (line.startsWith("data: ")) {
          try {
            if (!lock) {
              await onStart();
              lock = 1;
            }
            const parsedData = JSON.parse(line.replace("data: ", ""));
            await onMessage(parsedData.msg);
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            onError(parseError);
          }
        }
      });
    }
    await onEnd();
  } catch (error) {
    console.error("Streaming error:", error);
    onError(error);
  }
};

export async function getTitle(history: MessageType[]) {
  const res = await axios.post(`${API_URL}/api/chat/generate-title`, {
    history,
  });

  return res.data;
}
