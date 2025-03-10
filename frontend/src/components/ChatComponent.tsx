import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { sendPrompt } from "../utils";

const ChatComponent = () => {
  const [message, setMessage] = useState(""); // Store entire response as a string
  const [input, setInput] = useState("");

  const handleSend = async () => {
    setMessage(""); // Clear previous response
    await sendPrompt(input, (newMessage) => {
      setMessage((prev) => prev + newMessage); // Append streamed chunks
    });
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your prompt"
      />
      <button onClick={handleSend}>Send</button>

      <div>
        <h3>Response:</h3>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <ReactMarkdown>{message}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
