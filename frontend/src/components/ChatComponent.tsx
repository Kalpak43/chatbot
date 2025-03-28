import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useCallback, useEffect, useState } from "react";
import {
  addNewMessage,
  appendMessageContent,
  createNewChat,
  fetchMessages,
  updateChatStatus,
  updateMessageStatus,
} from "../features/chats/chatThunk";
import { sendPrompt } from "../utils";
import { SendHorizontal } from "lucide-react";
import { resetMessages } from "../features/chats/chatSlice";
import { liveQuery } from "dexie";
import db from "../db";
import { store } from "../app/store";

export const ChatInput = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeMessages = useAppSelector((state) => state.chat.activeMessages);

  const [input, setInput] = useState("");

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

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
        text: input,
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
      chatHistory: [...activeMessages, { role: "user", text: input }],
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
  }, [chatId, input, navigate, activeMessages]);

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
        // disabled={loading}
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
            {
              user: <></>,
              ai: <></>,
            }[message.role]
            // <>

            //   {message.role === "user" ? (
            //     <></>
            //   ) : (
            //     <></>
            //     // <UserBubble key={message.id} msg={message.text} />
            //     // <AIBubble key={message.id} msg={message.text} />
            //   )}
            // </>
          )
        )}
      </div>
    </section>
  );
};

export function UserBubble({ msg }: { msg: MessageType }) {

  

  return (
    <div className="chat chat-end">
      <div className="chat-bubble chat-bubble-primary  text-white">
        {msg.text}
      </div>
    </div>
  );
}
