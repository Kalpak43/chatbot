export const sendPrompt = async (
  chatHistory: { role: "user" | "ai"; text: string }[],
  onMessage: (msg: string) => void
) => {
  const response = await fetch("http://127.0.0.1:8080/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history: chatHistory }),
  });

  if (!response.ok) {
    console.error("Error:", response.statusText);
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      chunk.split("\n").forEach((line) => {
        if (line.startsWith("data: ")) {
          const parsedData = JSON.parse(line.replace("data: ", ""));
          onMessage(parsedData.msg);
        }
      });
    }
  } catch (error) {
    console.error("Streaming error:", error);
  }
};
