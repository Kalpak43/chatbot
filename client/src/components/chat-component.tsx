import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Mic,
  MicOff,
  Paperclip,
  SendHorizonal,
  StopCircle,
  X,
} from "lucide-react";
import ChatBubble from "./ui/chat-bubble";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

import db from "@/dexie";
import {
  resetMessages,
  setActiveChat,
  setError,
} from "@/features/chats/chatSlice";
import {
  addNewMessage,
  appendMessageContent,
  createNewChat,
  fetchMessages,
  getChat,
  updateChat,
  updateMessage,
} from "@/features/chats/chatThunk";
import { liveQuery } from "dexie";
import { useNavigate } from "react-router";
import { getTitle, sendPrompt } from "@/services/ai-service";
import TypingIndicator from "./ui/typing-indicator";
import VoiceToText from "./voice-to-text";
import { uploadToStorage } from "@/services/upload-service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface History {
  role: "user" | "ai";
  text: string;
  attachments: Attachment[];
}

interface ChatContextType {
  chatId: string | null;
  prompt: string;
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  handlePromptInput: (x: string) => void;
  handleSend: (message: string, attachments: Attachment[]) => void;
  handlePrompt: (
    chatHistory: History[],
    messageId: string,
    chatId: string
  ) => void;
  handleAbort: () => void;
  isStreaming: boolean;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

function Chat({
  chatId,
  children,
}: {
  chatId: string | null;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeMessages = useAppSelector((state) => state.chat.activeMessages);
  const activeChat = useAppSelector((state) => state.chat.activeChat);

  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [isStreaming, setIsStreaming] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  useEffect(() => {
    const getTitleSomeHow = async () => {
      if (
        chatId &&
        activeChat &&
        !activeChat.title.trim() &&
        activeMessages.length > 1 &&
        activeMessages[activeMessages.length - 1].status == "done"
      ) {
        console.log("GETTING TITLE");
        const title = await getTitle(activeMessages);

        dispatch(
          updateChat({
            chatId,
            data: {
              title,
            },
          })
        );
      }
    };

    getTitleSomeHow();
  }, [
    chatId,
    activeChat?.title,
    activeMessages.length,
    activeMessages[activeMessages.length - 1]?.status,
  ]);

  useEffect(() => {
    dispatch(resetMessages());
    dispatch(setActiveChat(null));
    dispatch(setError(null));

    if (!chatId) {
      return;
    }

    dispatch(getChat(chatId));

    const subscription = liveQuery(async () =>
      db.messages.where({ chatId }).toArray()
    ).subscribe({
      next: (messages) => {
        // Dispatch messages to Redux store
        dispatch(
          fetchMessages.fulfilled(
            [...messages].sort((a, b) => a.created_at - b.created_at),
            fetchMessages.typePrefix,
            ""
          )
        );
      },
      error: (error) => {
        console.error("Error fetching messages:", error);
      },
    });

    return () => {
      subscription.unsubscribe(); // Clean up subscription on unmount
    };
  }, [chatId]);

  const handlePromptInput = (x: string) => {
    setPrompt(x);
  };

  const handlePrompt = async (
    chatHistory: History[],
    messageId: string,
    chatId: string
  ) => {
    const controller = new AbortController();
    setAbortController(controller);
    setIsStreaming(true);

    await sendPrompt({
      chatHistory,
      onMessage: async (msg) => {
        await dispatch(
          appendMessageContent({ messageId: messageId, content: msg })
        );
      },
      onStart: async () => {
        await dispatch(
          updateMessage({
            messageId: messageId,
            data: {
              status: "pending",
            },
          })
        );

        await dispatch(
          updateChat({
            chatId: chatId,
            data: {
              status: "pending",
            },
          })
        );
      },
      onEnd: async () => {
        await dispatch(
          updateMessage({
            messageId: messageId,
            data: {
              status: "done",
            },
          })
        );

        await dispatch(
          updateChat({
            chatId: chatId,
            data: {
              last_message_at: new Date().getTime(),
              status: "done",
            },
          })
        );

        setIsStreaming(false);
        setAbortController(null);
      },
      onError: async (error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          console.log("ABORTED");
          console.log(error);

          await dispatch(
            updateChat({
              chatId: chatId,
              data: {
                last_message_at: new Date().getTime(),
                status: "done",
              },
            })
          );
        } else {
          await dispatch(
            updateMessage({
              messageId: messageId,
              data: {
                status: "failed",
              },
            })
          );

          await dispatch(
            updateChat({
              chatId: chatId,
              data: {
                last_message_at: new Date().getTime(),
                status: "failed",
              },
            })
          );
        }

        setIsStreaming(false);
        setAbortController(null);

        if (error instanceof Error) {
          dispatch(setError(error.message));
        } else {
          dispatch(setError("Some Error occured"));
        }
      },
      signal: controller.signal,
      id: chatId,
    });
  };

  const handleSend = async (message: string, attachments: Attachment[]) => {
    if (!message.trim()) return;

    setPrompt("");
    setAttachments([]);

    let id = chatId;

    if (!id) {
      const newChat = await dispatch(createNewChat());

      if (!(newChat.payload as ChatType).id) return;

      id = (newChat.payload as ChatType).id;
    }

    await dispatch(
      addNewMessage({
        chatId: id,
        role: "user",
        text: message,
        status: "done",
        attachments: attachments,
      })
    );

    await dispatch(
      updateChat({
        chatId: id,
        data: {
          last_message_at: new Date().getTime(),
        },
      })
    );

    if (!chatId) navigate(`/chat/${id}`);

    // will be completed by `sendPrompt`
    const responseId = await dispatch(
      addNewMessage({
        chatId: id,
        role: "ai",
        text: "",
        status: "typing",
      })
    ).then((action) => action.payload as string);

    const controller = new AbortController();
    setAbortController(controller);

    const chatHistory: History[] = [
      ...(activeMessages.filter(
        (message) => message.status != "deleted"
      ) as History[]),
      { role: "user", text: message, attachments: attachments },
    ];

    handlePrompt(chatHistory, responseId, id!);
  };

  const handleAbort = async () => {
    if (!abortController) return;

    abortController.abort();
    setAbortController(null);
  };

  return (
    <ChatContext.Provider
      value={{
        chatId,
        prompt,
        attachments,
        setAttachments,
        handlePromptInput,
        handleSend,
        handlePrompt,
        handleAbort,
        isStreaming,
      }}
    >
      <div className="w-full flex-1 overflow-y-auto flex flex-col">
        {children}
      </div>
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);

Chat.Area = function Area() {
  const { chatId, handlePrompt } = useChat();

  const dispatch = useAppDispatch();
  const activeMessages = useAppSelector((state) => state.chat.activeMessages);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null); // Ref for the chat container

  const latestUserMessage = useMemo(
    () =>
      activeMessages
        .slice()
        .reverse()
        .find((msg) => msg.role === "user"),
    [activeMessages]
  );

  useEffect(() => {
    if (
      latestUserMessage &&
      chatContainerRef.current &&
      messagesEndRef.current
    ) {
      messagesEndRef.current.style.height = "200px";

      const userMessageElement = document.getElementById(
        `message-${latestUserMessage.id}`
      );

      if (userMessageElement) {
        const container = chatContainerRef.current;
        const elementTop = userMessageElement.offsetTop;
        container.scrollTo({
          top: elementTop,
          behavior: "smooth",
        });
      }
    }
  }, [latestUserMessage?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleEditMessage = async (messageId: string, content: string) => {
    if (!chatId) return;

    await dispatch(
      updateMessage({
        messageId: messageId,
        data: {
          text: content,
          status: "done",
        },
      })
    );

    const editedMessage = activeMessages.find((msg) => msg.id === messageId);
    if (!editedMessage) return;

    const messagesToDelete = activeMessages.filter(
      (msg) =>
        msg.created_at > editedMessage.created_at && msg.status !== "deleted"
    );

    for (const msg of messagesToDelete) {
      await dispatch(
        updateMessage({
          messageId: msg.id,
          data: {
            status: "deleted",
          },
        })
      );
    }

    // will be completed by `sendPrompt`
    const responseId = await dispatch(
      addNewMessage({
        chatId: chatId,
        role: "ai",
        text: "",
        status: "typing",
      })
    ).then((action) => action.payload as string);

    const chatHistory: History[] = [
      ...activeMessages.filter(
        (msg) =>
          msg.created_at < editedMessage.created_at && msg.status !== "deleted"
      ),
      {
        ...editedMessage,
        text: content,
      },
    ];

    handlePrompt(chatHistory, responseId, chatId);
  };

  return (
    <div className="h-full overflow-y-auto" ref={chatContainerRef}>
      <div className="max-w-3xl mx-auto px-4">
        {activeMessages
          .filter((msg) => msg.status != "deleted")
          .map((message) => {
            // Don't pre-create the component and reuse it
            if (message.status === "typing") {
              return <TypingIndicator key={message.id} id={message.id} />;
            } else if (
              message.status === "pending" ||
              message.status === "done"
            ) {
              return (
                <ChatBubble
                  key={message.id}
                  id={message.id}
                  content={message.text}
                  attachments={message.attachments}
                  sender={message.role}
                  onEdit={handleEditMessage}
                />
              );
            } else if (message.status === "failed") {
              return <p key={message.id}>Some error occurred</p>;
            }
            return null; // Handle any other status
          })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

Chat.Input = function Input() {
  const {
    prompt,
    handlePromptInput,
    handleSend,
    attachments,
    setAttachments,
    handleAbort,
    isStreaming,
  } = useChat();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const user = useAppSelector((state) => state.auth.user);

  const [isListening, setIsListening] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const el = inputRef.current;

    const handleFocus = () => {
      setTimeout(() => {
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300); // allow time for keyboard to appear
    };

    el?.addEventListener("focus", handleFocus);
    return () => {
      el?.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleVoiceText = (text: string) => {
    handlePromptInput(prompt + text);
  };

  const handleUpload = async (file: File) => {
    toast.loading("Uploading your file");

    const url = await uploadToStorage(file);
    if (!url) {
      console.error("Failed to upload file");
      toast.dismiss();
      toast.error("Failed to upload file");
      return;
    }

    const newAttachment: Attachment = {
      url: url,
      type: file.type.startsWith("image") ? "image" : "file",
    };

    setAttachments((prev) => [...prev, newAttachment]);
    toast.dismiss();
    toast.success("Successfully uploaded the file");
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // setDragCounter((prev) => prev + 1);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      e.currentTarget &&
      !(e.currentTarget as Node).contains(e.relatedTarget as Node | null)
    ) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragOver(true);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragOver(false);

    if (!user) {
      toast.error("Please log in to upload files");
      return;
    }

    const files = Array.from(e.dataTransfer.files);

    if (files.length === 0) return;

    // Handle multiple files
    for (const file of files) {
      await handleUpload(file);
    }
  };

  return (
    <Card
      className={`w-full max-w-3xl mx-auto sticky bottom-0 md:mb-2 py-4 px-0 transition-colors duration-200 ${
        isDragOver
          ? "border-2 border-secondary border-dashed bg-blue-50 dark:bg-primary/10"
          : "border border-transparent"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {attachments.length > 0 && (
        <div className="absolute inset-x-0 bottom-full md:mx-6 bg-card/50 backdrop-blur-md rounded-t-xl -z-1 [box-shadow:0px_-2px_4px_#e3e3e320] p-4 flex items-center gap-2">
          {attachments.map((attachment, idx) => (
            <div
              key={idx}
              className={cn(
                "w-12 aspect-square rounded-md [box-shadow:0px_0px_3px_#e3e3e320]",
                "relative before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-t before:from-black/40 before:to-transparent"
              )}
            >
              <Button
                variant="destructive"
                size={"icon"}
                className={cn(
                  "px-1 py-1 w-fit h-auto text-xs [&_svg:not([class*='size-'])]:size-2 bg-destructive/40",
                  "absolute top-0 right-0 translate-x-1/4 -translate-y-1/4"
                )}
                onClick={() => {
                  setAttachments((prev) => prev.filter((_, i) => i !== idx));
                }}
              >
                <X size={10} />
              </Button>

              {attachment.type === "image" ? (
                <img
                  src={attachment.url}
                  alt="attachment"
                  className="object-cover w-full h-full rounded-md"
                />
              ) : (
                <span className="text-xs text-center px-1 h-full flex items-center justify-center">
                  {attachment.url.split(".").pop()?.split("?")[0] || "FILE"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <CardContent className="md:px-4">
        <form
          action=""
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(prompt, attachments);
          }}
        >
          <Textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => handlePromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(prompt, attachments);
              }
            }}
            rows={5}
            placeholder="Type your message..."
            className="resize-none max-h-[200px]"
          />

          <div className="flex items-center justify-between">
            <div></div>
            <div className="space-x-2">
              <Button
                type="button"
                variant={"outline"}
                size={"icon"}
                className="relative"
                disabled={!user}
              >
                <Paperclip />
                <input
                  type="file"
                  // accept=""
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      handleUpload(file);
                    }
                  }}
                />
              </Button>

              {isStreaming ? (
                <Button
                  variant={"secondary"}
                  type="button"
                  size={"icon"}
                  onClick={handleAbort}
                >
                  <StopCircle />
                </Button>
              ) : isListening ? (
                <VoiceToText
                  isListening={isListening}
                  onListeningChange={setIsListening}
                  onVoice={handleVoiceText}
                >
                  <Button type="button" variant={"outline"} size={"icon"}>
                    <MicOff />
                  </Button>
                </VoiceToText>
              ) : !prompt.trim() ? (
                <VoiceToText
                  isListening={isListening}
                  onListeningChange={setIsListening}
                  onVoice={handleVoiceText}
                >
                  <Button type="button" variant={"outline"} size={"icon"}>
                    <Mic />
                  </Button>
                </VoiceToText>
              ) : (
                <Button size={"icon"}>
                  <SendHorizonal />
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

Chat.Intro = function Intro() {
  const { handlePromptInput } = useChat();
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col justify-center h-full space-y-4">
        <h1 className="text-3xl font-600 font-newsreader">
          Hello, What can I help you with?
        </h1>
        <ul className="flex flex-col space-y-2 w-full">
          <li>
            <Button
              variant="outline"
              className="w-full justify-start italic font-400"
              onClick={() => {
                handlePromptInput(
                  "What can I cook with chicken, garlic, and rice?"
                );
              }}
            >
              What can I cook with chicken, garlic, and rice?
            </Button>
          </li>
          <li>
            <Button
              variant="outline"
              className="w-full justify-start italic font-400"
              onClick={() => {
                handlePromptInput(
                  "Can you explain quantum physics in simple terms?"
                );
              }}
            >
              Can you explain quantum physics in simple terms?
            </Button>
          </li>
          <li>
            <Button
              variant="outline"
              className="w-full justify-start italic font-400"
              onClick={() => {
                handlePromptInput(
                  "Help me write a professional email to my manager."
                );
              }}
            >
              Help me write a professional email to my manager.
            </Button>
          </li>
          <li>
            <Button
              variant="outline"
              className="w-full justify-start italic font-400"
              onClick={() => {
                handlePromptInput("What's a fun weekend activity near me?");
              }}
            >
              What's a fun weekend activity near me?
            </Button>
          </li>
          <li>
            <Button
              variant="outline"
              className="w-full justify-start italic font-400"
              onClick={() => {
                handlePromptInput("Can you summarize this article for me?");
              }}
            >
              Can you summarize this article for me?
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Chat;
