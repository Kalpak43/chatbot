import axios from "axios";
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
}: {
  chatHistory: ChatHistory[];
  model: string;
  webSearch: boolean;
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
            await new Promise((resolve) => setTimeout(resolve, 1));
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
