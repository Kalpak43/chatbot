import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { convertToMp3, sendPrompt } from "../utils";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import AudioRecorder from "./AudioRecorder";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addMessage, createChat } from "../features/chats/chatSlice";

const ChatComponent = () => {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chat.chats);
  const activeChatId = useAppSelector((state) => state.chat.activeChatId);
  const activeChat = chats.find((c) => c.id === activeChatId) || {
    messages: [],
  };

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (chats.length === 0) dispatch(createChat());
  }, [dispatch, chats.length]);

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    let newUserMessage: MessageType = { role: "user", text: input };

    if (file) {
      newUserMessage = {
        ...newUserMessage,
        file: file,
      };
    }

    dispatch(addMessage({ chatId: activeChatId!, message: newUserMessage }));
    setInput("");

    // let aiResponse = "";
    // await sendPrompt(
    //   [...(messages as MessageType[]), newUserMessage as MessageType],
    //   (chunk) => {
    //     aiResponse += chunk;
    //     setMessages((prev) => [
    //       ...(prev[prev.length - 1].role === "ai" ? prev.slice(0, -1) : prev),
    //       { role: "ai", text: aiResponse },
    //     ]); // Update AI message as it streams
    //   }
    // );
    let aiResponse = "";
    await sendPrompt([...activeChat.messages, newUserMessage], (chunk) => {
      aiResponse += chunk;
      dispatch(
        addMessage({
          chatId: activeChatId!,
          message: { role: "ai", text: aiResponse },
        })
      );
    });
  };

  async function handleStopRecording(recordedData: {
    duration: number;
    audioBlob: Blob;
  }) {
    const mp3Blob = await convertToMp3(recordedData.audioBlob);
    const audioFile = new File([mp3Blob], "recording.mp3", {
      type: "audio/mp3",
    });

    setFile(audioFile);
    setStart(false);
  }

  useEffect(() => {
    console.log(file);
    if (file) handleSend();
  }, [file]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Chat with AI
        </h2>

        <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] overflow-y-auto">
          {activeChat.messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 my-1 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter
                        // @ts-ignore
                        style={dracula}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 mt-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg"
            rows={5}
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Send
          </button>
          <AudioRecorder
            onStart={() => setStart(true)}
            onStop={handleStopRecording}
          >
            <span className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              {start ? "Stop" : "Record"}
            </span>
          </AudioRecorder>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
