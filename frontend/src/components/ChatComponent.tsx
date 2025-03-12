import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { convertToMp3, sendPrompt } from "../utils";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import AudioRecorder from "./AudioRecorder";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addMessage } from "../features/chats/chatSlice";
import { Check, Copy, Mic, MicOff, SendHorizontal } from "lucide-react";

import "../styles/chatStyles.css";

{
  /* <Copy />; */
}

const ChatComponent = ({ activeChatId }: { activeChatId: string }) => {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chat.chats);
  const activeChat = chats.find((c) => c.id === activeChatId) || {
    title: "Untitled",
    messages: [],
  };

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);

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
    setFile(null);

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
    if (file) handleSend();
  }, [file]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat.messages]);

  return (
    <div className="h-[100dvh] relative bg-gray-200 flex flex-col">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 sticky top-0 inset-x-0 bg-white  p-4 border-b">
        {activeChat.title}
      </h2>

      <div className="px-4 flex-1 min-h-[200px] overflow-y-auto chat p-4">
        {activeChat.messages.length > 0 ? (
          activeChat.messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 my-4 max-w-2/3 rounded-lg space-y-4 ${
                msg.role === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-300 text-gray-800 mr-auto"
              }`}
            >
              {msg.file && (
                <audio controls>
                  <source
                    src={URL.createObjectURL(msg.file)}
                    type="audio/mpeg"
                  />
                </audio>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const [copied, setCopied] = useState(false);

                    const handleCopy = (text: string) => {
                      navigator.clipboard
                        .writeText(text) // Copy text to clipboard
                        .then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        })
                        .catch((err) => console.error("Failed to copy: ", err));
                    };

                    return match ? (
                      <div className="relative">
                        {/* Copy Button */}
                        <button
                          onClick={() =>
                            handleCopy(String(children).replace(/\n$/, ""))
                          }
                          className="cursor-pointer absolute top-2 right-2 bg-gray-700 text-white p-1 rounded-md hover:bg-gray-600 transition"
                        >
                          {copied ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>

                        {/* Code Block */}
                        <SyntaxHighlighter
                          // @ts-ignore
                          style={dracula}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                          className="rounded-md p-2"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code
                        className={`bg-gray-200 px-1 py-0.5 rounded text-sm ${
                          className || ""
                        }`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-gray-500 italic pl-3 text-gray-600">
                        {children}
                      </blockquote>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a href={href} className="text-blue-500 underline">
                        {children}
                      </a>
                    );
                  },
                  ul({ children }) {
                    return (
                      <ul className="list-disc list-inside ml-4">{children}</ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol className="list-decimal list-inside ml-4">
                        {children}
                      </ol>
                    );
                  },
                  h1({ children }) {
                    return <h1 className="text-2xl font-bold">{children}</h1>;
                  },
                  h2({ children }) {
                    return (
                      <h2 className="text-xl font-semibold">{children}</h2>
                    );
                  },
                  h3({ children }) {
                    return <h3 className="text-lg font-medium">{children}</h3>;
                  },
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ))
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            Start a chat
          </div>
        )}
        <div ref={chatRef} />
      </div>

      <div className="flex space-x-2 mt-4 sticky bottom-0 inset-x-0  bg-white p-4 border-t">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg mb-2"
          rows={1}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-2"
        >
          <SendHorizontal />
        </button>
        <AudioRecorder
          onStart={() => setStart(true)}
          onStop={handleStopRecording}
        >
          <span className="block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-2">
            {start ? <MicOff /> : <Mic />}
          </span>
        </AudioRecorder>
      </div>
    </div>
  );
};

export default ChatComponent;
