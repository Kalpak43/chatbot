import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { cleanMarkdown, convertToMp3, getTitle, sendPrompt } from "../utils";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import AudioRecorder from "./AudioRecorder";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  addMessage,
  deleteMessage,
  editMessage,
  setTitle,
  setTyping,
} from "../features/chats/chatSlice";
import {
  Check,
  Copy,
  Loader2,
  MessageCircleMore,
  Mic,
  MicOff,
  Pencil,
  SendHorizontal,
  Trash,
} from "lucide-react";

import "../styles/chatStyles.css";

const API_URL = import.meta.env.VITE_API_URL;

const ChatComponent = ({ activeChatId }: { activeChatId: string }) => {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chat.chats);
  const activeChat = chats.find((c) => c.id === activeChatId) || {
    title: "Untitled",
    messages: [],
  };
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const setTitleFromChat = async () => {
      const data = await getTitle([...activeChat.messages]);

      dispatch(
        setTitle({
          title: data.title,
          chatId: activeChatId,
        })
      );
      setEnded(false);
    };

    if (
      ended &&
      (activeChat.messages.length < 3 || activeChat.messages.length % 6 === 0)
    ) {
      setTitleFromChat();
    }
  }, [ended, activeChat.messages]);

  const handleMessageSend = async (message: MessageType) => {
    dispatch(addMessage({ chatId: activeChatId!, message: message }));

    dispatch(setTyping(true));

    let aiResponse = "";
    await sendPrompt([...activeChat.messages, message], (chunk) => {
      aiResponse += chunk;
      if (!!aiResponse.trim()) {
        dispatch(setTyping(false));
      }
      dispatch(
        addMessage({
          chatId: activeChatId!,
          message: { role: "ai", text: aiResponse },
        })
      );
    });

    setEnded(true);
  };

  return (
    <div className="h-[100dvh] relative flex flex-col bg-base-100">
      {/* Chat Header */}
      {/* <ChatTitleBar activeChatId={activeChatId} /> */}

      {/* Chat Messages */}
      <ChatArea activeChatId={activeChatId} />

      {/* Chat Input Section */}
      <ChatInput handleMessageSend={handleMessageSend} />
    </div>
  );
};

export default ChatComponent;

export const ChatTitleBar = ({ activeChatId }: { activeChatId: string }) => {
  const chats = useAppSelector((state) => state.chat.chats);
  const activeChat = chats.find((c) => c.id === activeChatId) || {
    title: "Untitled",
    messages: [],
  };

  return (
    <h2 className="max-md:hidden md:text-xl font-semibold p-4 sticky top-0 inset-x-0 border-b bg-base-200 shadow-md z-50">
      {activeChat.title}
    </h2>
  );
};

export const ChatInput = ({
  handleMessageSend,
}: {
  handleMessageSend: (message: MessageType) => Promise<void>;
}) => {
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(false);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    // Send file for transcription
    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      const response = await fetch(`${API_URL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription request failed");
      }

      const data = await response.json();
      setInput(data.msg); // Set the transcribed text to input
    } catch (error) {
      console.error("Transcription error:", error);
    }

    setLoading(false);
  }

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    let newUserMessage: MessageType = { role: "user", text: input };

    if (file) {
      newUserMessage = {
        ...newUserMessage,
        file: file,
      };
    }

    setInput("");
    setFile(null);

    await handleMessageSend(newUserMessage);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="flex max-md:flex-col items-end gap-2 sticky bottom-0 inset-x-0 p-4 border-t bg-base-200 shadow-md"
    >
      <textarea
        value={input}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent new line
            handleSend(); // Submit the form
          }
        }}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="textarea textarea-bordered flex-1 w-full"
        rows={1}
        disabled={loading}
      />
      <div className="flex gap-2 max-md:justify-between max-md:w-full">
        <button className="btn btn-primary max-md:order-2">
          <SendHorizontal />
        </button>
        <AudioRecorder
          onStart={() => setStart(true)}
          onStop={handleStopRecording}
        >
          <span className="btn btn-primary max-md:order-1">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : start ? (
              <MicOff />
            ) : (
              <Mic />
            )}
          </span>
        </AudioRecorder>
      </div>
    </form>
  );
};

export const ChatArea = ({ activeChatId }: { activeChatId: string }) => {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chat.chats);
  const typing = useAppSelector((state) => state.chat.typing);
  const activeChat = chats.find((c) => c.id === activeChatId) || {
    title: "Untitled",
    messages: [],
  };
  const chatRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    console.log("TYPING: ", typing);
  }, [typing]);

  useEffect(() => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  }, [activeChat.messages]);

  const handleEdit = (index: number, text: string) => {
    setEditingMessageId(index);
    setEditedText(text);
  };

  const handleSaveEdit = async (chatId: string, messageId: number) => {
    if (editedText.trim() == activeChat.messages[messageId].text.trim()) {
      setEditingMessageId(null);
      return;
    }
    dispatch(editMessage({ chatId, messageId, newText: editedText }));
    dispatch(deleteMessage({ chatId, messageId: messageId + 1 }));
    setEditingMessageId(null);

    const updatedChatHistory = activeChat.messages.slice(0, messageId);
    const newEditedUserMessage: MessageType = {
      role: "user",
      text: editedText,
    };

    let aiResponse = "";
    dispatch(setTyping(true));

    await sendPrompt([...updatedChatHistory, newEditedUserMessage], (chunk) => {
      aiResponse += chunk;
      if (!!aiResponse.trim()) {
        dispatch(setTyping(false));
      }
      dispatch(
        addMessage({
          chatId: chatId!,
          message: { role: "ai", text: aiResponse },
        })
      );
    });
  };

  const handleDelete = (chatId: string, messageId: number) => {
    dispatch(deleteMessage({ chatId, messageId }));
  };

  return (
    <div className="px-4 flex-1 min-h-[200px] overflow-y-auto chat p-4 space-y-4">
      {activeChat.messages.length > 0 ? (
        activeChat.messages.map((msg, index) => (
          <div
            key={index}
            className={`chat leading-loose relative ${
              msg.role === "user" ? "chat-end mb-8" : "chat-start"
            }`}
          >
            <div
              className={`chat-bubble p-3 ${
                msg.role === "user" ? "chat-bubble-primary" : "overflow-x-auto"
              }`}
            >
              {editingMessageId === index ? (
                <div>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="input input-bordered w-full text-neutral-content min-w-lg"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(activeChatId, index)}
                      className="btn  btn-outline btn-xs mt-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingMessageId(null);
                      }}
                      className="btn  btn-outline btn-xs mt-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const [copied, setCopied] = useState(false);

                      const handleCopy = (text: string) => {
                        navigator.clipboard
                          .writeText(text)
                          .then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          })
                          .catch((err) =>
                            console.error("Failed to copy: ", err)
                          );
                      };

                      return match ? (
                        <div className="relative">
                          {/* Copy Button */}
                          <button
                            onClick={() =>
                              handleCopy(String(children).replace(/\n$/, ""))
                            }
                            className="absolute top-2 right-2 btn btn-xs btn-ghost"
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
                            className="rounded-lg p-2"
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code
                          className={`bg-neutral p-1 rounded inline ${
                            className ? "inline-block w-full relative" : ""
                          }`}
                        >
                          {children}
                          {/* Copy Button */}
                          {className && (
                            <button
                              onClick={() =>
                                handleCopy(String(children).replace(/\n$/, ""))
                              }
                              className="absolute top-2 right-2 btn btn-xs btn-ghost"
                            >
                              {copied ? (
                                <Check size={16} className="text-green-400" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          )}
                        </code>
                      );
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-gray-500 italic pl-3">
                          {children}
                        </blockquote>
                      );
                    },
                    a({ href, children }) {
                      return (
                        <a href={href} className="text-primary underline">
                          {children}
                        </a>
                      );
                    },
                    ul({ children }) {
                      return <ul className="list-disc ml-4">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal ml-4">{children}</ol>;
                    },
                    h1({ children }) {
                      return (
                        <h1 className="text-4xl font-bold text-primary">
                          {children}
                        </h1>
                      );
                    },
                    h2({ children }) {
                      return (
                        <h2 className="text-3xl font-semibold text-secondary">
                          {children}
                        </h2>
                      );
                    },
                    h3({ children }) {
                      return (
                        <h3 className="text-2xl font-medium text-accent">
                          {children}
                        </h3>
                      );
                    },
                    h4({ children }) {
                      return (
                        <h4 className="text-xl font-medium  text-info">
                          {children}
                        </h4>
                      );
                    },
                    h5({ children }) {
                      return (
                        <h5 className="text-lg font-normal text-base-content">
                          {children}
                        </h5>
                      );
                    },
                    h6({ children }) {
                      return (
                        <h6 className="text-md font-light text-base-content/80">
                          {children}
                        </h6>
                      );
                    },
                  }}
                >
                  {cleanMarkdown(msg.text)}
                </ReactMarkdown>
              )}
            </div>

            {msg.role === "user" && (
              <div className="absolute top-full right-0 flex space-x-2">
                <button
                  onClick={() => handleEdit(index, msg.text)}
                  className="btn btn-xs"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(activeChatId, index)}
                  className="btn btn-xs btn-error"
                >
                  <Trash size={16} />
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center text-gray-500">
          <MessageCircleMore className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-lg font-medium text-gray-600">Start a chat</p>
          <p className="text-sm text-gray-400">Send a message to begin</p>
        </div>
      )}
      {typing && (
        <div className={`chat leading-loose relative chat-start mb-8`}>
          <div className={`p-3`}>
            <span className="loading loading-dots loading-md"></span>
          </div>
        </div>
      )}
      {activeChat.messages.length > 0 && <div ref={chatRef} className="h-0" />}
    </div>
  );
};
