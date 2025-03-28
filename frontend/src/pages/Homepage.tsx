import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useCallback, useEffect, useState } from "react";
import { SendHorizontal } from "lucide-react";
// import { appendMessageContent, getMessages } from "../db";
import { liveQuery } from "dexie";
import { cleanMarkdown, getTitle, sendPrompt } from "../utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "../styles/chatStyles.css";
import {
  addNewMessage,
  appendMessageContent,
  createNewChat,
  fetchMessages,
  getMessages,
  updateChatStatus,
  updateChatTitle,
  updateMessageStatus,
} from "../features/chats/chatThunk";
import { resetMessages } from "../features/chats/chatSlice";
import db from "../db";
import { store } from "../app/store";

function Homepage() {
  const { chatId } = useParams();
  const dispatch = useAppDispatch();
  const activeMessages = useAppSelector((state) => state.chat.activeMessages);

  useEffect(() => {
    async function setChatTitle() {
      if (chatId) {
        const chat = await db.chats.get({ id: chatId });
        if (
          chat &&
          !chat.title.trim() &&
          activeMessages[activeMessages.length - 1].status === "done" &&
          activeMessages.length > 0 &&
          (activeMessages.length == 2 || activeMessages.length % 10 == 0)
        ) {
          const title = await getTitle(activeMessages).then((res) => res.title);
          console.log(title);
          await dispatch(
            updateChatTitle({
              chatId,
              title,
            })
          );
        }
      }
    }

    setChatTitle();
  }, [activeMessages, chatId]);

  return (
    <div className="relative h-full">
      {/* <ChatComponent /> */}
      {/* <Sidebar /> */}
      <ChatArea />
      <ChatInput />
    </div>
  );
}

export default Homepage;

export const ChatInput = () => {
  const { chatId } = useParams();
  const dispatch = useAppDispatch();
  const activeMessages = useAppSelector((state) => state.chat.activeMessages);
  const chats = useAppSelector((state) => state.chat.chats);
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!input.trim() && !file) return;

    let id = chatId;
    if (!id) {
      const newChat = await dispatch(createNewChat());

      if ((newChat.payload as ChatType)?.id) {
        id = (newChat.payload as ChatType).id;
      } else {
        return;
      }
    }

    await dispatch(
      addNewMessage({
        chatId: id,
        role: "user",
        text: input,
        status: "done",
      })
    );

    if (!chatId) navigate(`/chat/${id}`);
    const messageId = await dispatch(
      addNewMessage({
        chatId: id,
        role: "ai",
        text: "",
        status: "typing",
      })
    ).then((action) => action.payload as string);
    await sendPrompt({
      chatHistory: [...activeMessages, { role: "user", text: input }],
      onMessage: async (msg) => {
        await dispatch(appendMessageContent({ messageId, text: msg }));
      },
      onStart: async () => {
        await dispatch(updateMessageStatus({ messageId, status: "pending" }));
        await dispatch(updateChatStatus({ chatId: id, status: "pending" }));
      },
      onEnd: async () => {
        await dispatch(updateMessageStatus({ messageId, status: "done" }));
        await dispatch(updateChatStatus({ chatId: id, status: "done" }));
      },
      onError: (error) => {
        console.error("Error sending prompt:", error);
      },
    });
  }, [chatId, input, file, navigate, activeMessages]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="flex max-md:flex-col items-end gap-2 p-4 border border-neutral bg-base-200 shadow-md max-w-3xl mx-auto absolute bottom-0 inset-x-0 rounded-t-xl"
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
        <button className="btn btn-primary btn-sm max-md:order-2">
          <SendHorizontal size={20} />
        </button>
        {/* <AudioRecorder
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
        </AudioRecorder> */}
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

  return (
    <section className="p-4 pb-40 h-full overflow-y-auto">
      <div className=" max-w-3xl mx-auto">
        {activeMessages.map((message) =>
          message.status === "typing" ? (
            <span className="loading loading-dots loading-xl"></span>
          ) : (
            <>
              {message.role === "user" ? (
                <UserBubble key={message.id} msg={message.text} />
              ) : (
                <AIBubble key={message.id} msg={message.text} />
              )}
            </>
          )
        )}
      </div>
    </section>
  );
};

export function UserBubble({ msg }: { msg: string }) {
  return (
    <div className="chat chat-end">
      <div className="chat-bubble chat-bubble-primary  text-white">{msg}</div>
    </div>
  );
}

export function AIBubble({ msg }: { msg: string }) {
  return (
    <div className="chat ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
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
              <h1 className="text-4xl font-bold text-primary">{children}</h1>
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
              <h3 className="text-2xl font-medium text-accent">{children}</h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-xl font-medium  text-info">{children}</h4>
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
        {cleanMarkdown(msg)}
      </ReactMarkdown>
    </div>
  );
}
