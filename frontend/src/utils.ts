export const sendPrompt = async (
  prompt: string,
  onMessage: (msg: string) => void
) => {
  const response = await fetch("http://localhost:8080/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    console.error("Error:", response.statusText);
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    console.error("Stream reader not available");
    return;
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // Extract actual message from SSE format
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
