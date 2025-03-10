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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full  bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Chat with AI
        </h2>

        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your prompt"
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-700">Response:</h3>
          <div className="mt-2 p-4 border rounded-lg bg-gray-50 min-h-[100px] text-gray-800">
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
