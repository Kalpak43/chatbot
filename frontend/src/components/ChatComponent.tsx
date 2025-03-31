import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useCallback, useEffect, useState } from "react";
import {
  addNewMessage,
  appendMessageContent,
  createNewChat,
  deleteMessage,
  fetchMessages,
  updateChatStatus,
  updateMessageContent,
  updateMessageStatus,
} from "../features/chats/chatThunk";
import { sendPrompt } from "../utils";
import { Pen, SendHorizonal, SendHorizontal, Trash2, X } from "lucide-react";
import { resetMessages } from "../features/chats/chatSlice";
import { liveQuery } from "dexie";
import db from "../db";
import { store } from "../app/store";
import VoiceToText from "./VoiceInput";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export const ChatInput = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeMessages = useAppSelector((state) => state.chat.activeMessages);

  const [input, setInput] = useState("");

  const handleSend = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setInput("");

      let id = chatId;
      // if id is not given in the url then create new chat
      if (!id) {
        const newChat = await dispatch(createNewChat());

        if ((newChat.payload as ChatType)?.id) {
          id = (newChat.payload as ChatType).id;
        } else {
          return;
        }
      }

      // add new user message
      await dispatch(
        addNewMessage({
          chatId: id,
          role: "user",
          text: message,
          status: "done",
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

      await sendPrompt({
        chatHistory: [...activeMessages, { role: "user", text: message }],
        onMessage: async (msg) => {
          await dispatch(
            appendMessageContent({ messageId: responseId, text: msg })
          );
        },
        onStart: async () => {
          await dispatch(
            updateMessageStatus({ messageId: responseId, status: "pending" })
          );
          await dispatch(updateChatStatus({ chatId: id, status: "pending" }));
        },
        onEnd: async () => {
          await dispatch(
            updateMessageStatus({ messageId: responseId, status: "done" })
          );
          await dispatch(updateChatStatus({ chatId: id, status: "done" }));
        },
        onError: (error) => {
          console.error("Error sending prompt:", error);
        },
      });
    },
    [chatId, input, navigate, activeMessages]
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend(input);
      }}
      className="flex max-md:flex-col items-end gap-2 p-4 border border-neutral bg-base-200 shadow-md xl:max-w-3xl xl:mx-auto xl:absolute xl:bottom-0 xl:inset-x-0 rounded-t-xl"
    >
      <textarea
        value={input}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent new line
            handleSend(input); // Submit the form
          }
        }}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="textarea textarea-bordered flex-1 w-full  resize-none"
        rows={1}
        // disabled={loading}
      />

      <div className="flex gap-2 max-md:justify-between max-md:w-full">
        {!input.trim() ? (
          <VoiceToText
            onVoice={(x) => {
              setInput((prev) => prev + x);
            }}
          />
        ) : (
          <button className="btn btn-primary btn-sm max-md:order-2">
            <SendHorizontal size={20} />
          </button>
        )}
      </div>
    </form>
  );
};

export const ChatArea = () => {
  const chatId = useParams().chatId;
  const dispatch = useAppDispatch();
  const { activeMessages } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (!chatId) {
      dispatch(resetMessages());
      return;
    }

    const subscription = liveQuery(async () =>
      db.messages.where({ chatId }).toArray()
    ).subscribe({
      next: (messages) => {
        // Dispatch messages to Redux store
        store.dispatch(
          fetchMessages.fulfilled(
            messages.sort((a, b) => a.created_at - b.created_at),
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

  const handleEditMessage = async (message: MessageType, content: string) => {
    if (!chatId) return;

    await dispatch(
      updateMessageContent({
        chatId: chatId,
        message: message,
        updatedContent: content,
      })
    );

    const newMessages = activeMessages.filter(
      (m) => m.created_at < message.created_at
    );

    // will be completed by `sendPrompt`
    const responseId = await dispatch(
      addNewMessage({
        chatId: chatId,
        role: "ai",
        text: "",
        status: "typing",
      })
    ).then((action) => action.payload as string);

    await sendPrompt({
      chatHistory: [
        ...newMessages,
        {
          ...message,
          text: content,
        } as MessageType,
      ],
      onMessage: async (msg) => {
        await dispatch(
          appendMessageContent({ messageId: responseId, text: msg })
        );
      },
      onStart: async () => {
        await dispatch(
          updateMessageStatus({ messageId: responseId, status: "pending" })
        );
        await dispatch(updateChatStatus({ chatId: chatId, status: "pending" }));
      },
      onEnd: async () => {
        await dispatch(
          updateMessageStatus({ messageId: responseId, status: "done" })
        );
        await dispatch(updateChatStatus({ chatId: chatId, status: "done" }));
      },
      onError: (error) => {
        console.error("Error sending prompt:", error);
      },
    });
  };

  const handleDeleteMessge = async (message: MessageType) => {
    if (!chatId) return;

    await dispatch(
      deleteMessage({
        chatId,
        message,
      })
    );
  };

  return (
    <section className="xl:pb-40 h-full overflow-y-auto">
      <div className="p-4 max-w-sm md:max-w-full xl:max-w-3xl mx-auto">
        {activeMessages.map((message) =>
          message.status === "typing" ? (
            <span className="loading loading-dots loading-xl"></span>
          ) : (
            {
              user: (
                <UserBubble
                  key={message.id}
                  msg={message}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessge}
                />
              ),
              ai: <AIBubble key={message.id} msg={message.text} />,
            }[message.role]
          )
        )}
      </div>
    </section>
  );
};

export function UserBubble({
  msg,
  onEdit,
  onDelete,
}: {
  msg: MessageType;
  onEdit: (message: MessageType, content: string) => Promise<void>;
  onDelete: (message: MessageType) => Promise<void>;
}) {
  const [content, setContent] = useState(msg.text);
  const [editing, setEditing] = useState(false);

  return (
    <div className="chat chat-end relative mb-12">
      <div className="chat-bubble chat-bubble-primary font-[600]">
        {editing ? (
          <div className="sm:min-w-xs md:min-w-sm lg:min-w-md">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              className="textarea textarea-bordered flex-1 w-full text-neutral-content [vertical-align:unset] resize-none"
              rows={1}
            />
          </div>
        ) : (
          content
        )}
      </div>
      <div className="absolute top-full flex gap-2 items-center">
        {editing && (
          <button
            className="btn btn-xs btn-soft btn-success  btn-square"
            onClick={async () => {
              setEditing((x) => !x);
              await onEdit(msg, content);
            }}
          >
            <SendHorizonal size={12} />
          </button>
        )}
        <button
          className="btn btn-xs btn-soft btn-info  btn-square"
          onClick={() => {
            editing && setContent(msg.text);
            setEditing((x) => !x);
          }}
        >
          {editing ? <X size={12} /> : <Pen size={12} />}
        </button>
        <button
          className="btn btn-xs btn-soft btn-error  btn-square"
          onClick={() => onDelete(msg)}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export function AIBubble({ msg }: { msg: string }) {
  return (
    <div className="chat leading-loose mb-8">
      {/* <Markdown>{msg}</Markdown> */}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-4xl font-bold text-primary leading-16"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-3xl font-semibold text-secondary leading-16"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-2xl font-medium text-accent leading-16"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl font-medium leading-16" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5
              className="text-lg font-normal text-info leading-16"
              {...props}
            />
          ),
          h6: ({ node, ...props }) => (
            <h6
              className="text-base font-light text-warning leading-16"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className="text-base text-neutral-content leading-tight mb-3"
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-neutral-content" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-4 italic text-neutral-content bg-base-200 p-3 my-3 rounded-lg"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside text-neutral-content"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside text-neutral-content"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="pl-4 mb-1" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-primary underline hover:text-primary-focus"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className=" border border-neutral mt-4 mb-8 rounded-md overflow-hidden">
              <table
                className="table table-zebra w-full bg-base-100"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead
              className=" bg-neutral text-white font-bold p-2"
              {...props}
            />
          ),
          tbody: ({ node, ...props }) => <tbody className=" p-2" {...props} />,
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg shadow-lg max-w-full h-auto my-3"
              {...props}
            />
          ),
          hr: ({ node, className, ...props }) => (
            <hr className="my-4" {...props} />
          ),
          code: ({ className, children, ...props }) => {
            // Check if className contains language-xyz (multi-line code block)
            const match = /language-(\w+)/.exec(className || "");
            console.log(match);

            if (match) {
              const language = match[1];
              return (
                <div className="max-w-[90vw] xl:max-w-[calc(48rem-2rem)] ">
                  {/* Language Title */}
                  <div className="bg-gray-700 text-gray-200 px-3 py-1 text-sm font-semibold rounded-t-md">
                    {language.toUpperCase()}
                  </div>

                  <div className="">
                    <SyntaxHighlighter
                      style={dracula}
                      language={language}
                      className="rounded-b-md"
                      customStyle={{ whiteSpace: "pre-wrap" }}
                    >
                      {String(children).trim()}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            }

            // Inline code (single word/phrase inside backticks)
            return (
              <code
                className="bg-gray-800 text-gray-100 px-1 rounded-md"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => <>{props.children}</>,
        }}
      >
        {msg}
      </ReactMarkdown>
    </div>
  );
}
