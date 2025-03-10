import { useState } from "react";
import { sendPrompt } from "../utils";

const ChatComponent = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    setMessages([]); // Clear previous messages

    await sendPrompt(input, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
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
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default ChatComponent;
