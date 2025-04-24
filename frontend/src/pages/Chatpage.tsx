import { useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useEffect } from "react";
import db from "../db";
import { getTitle } from "../utils";
import {
  fetchMessages,
  getChat,
  // updateChat,
  updateChatTitle,
} from "../features/chats/chatThunk";
import { ChatArea, ChatInput } from "../components/ChatComponent";
import "../styles/chatStyles.css";
import {
  resetMessages,
  setActiveChat,
  setError,
} from "../features/chats/chatSlice";
import { liveQuery } from "dexie";
// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL;

function Chatpage() {
  const { chatId } = useParams();
  const dispatch = useAppDispatch();
  const activeMessages = useAppSelector((state) => state.chat.activeMessages);

  // const activeChat = useAppSelector((state) => state.chat.activeChat);

  useEffect(() => {
    dispatch(resetMessages());
    dispatch(setActiveChat(null));
    dispatch(setError(null));

    if (!chatId) {
      return;
    }

    dispatch(
      getChat({
        id: chatId,
      })
    );

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

  useEffect(() => {
    async function setChatTitle() {
      // Only proceed if we have a chat ID
      if (!chatId) return;

      // Check if we should update the title based on messages length
      const shouldUpdateTitle =
        activeMessages.length > 1 &&
        activeMessages[activeMessages.length - 1].status === "done" &&
        (activeMessages.length === 2 || activeMessages.length % 10 === 0);

      if (!shouldUpdateTitle) return;

      // Now fetch the chat only once we know we might need to update
      const chat = await db.chats.get({ id: chatId });

      // Only generate title if the current one is empty
      if (chat && !chat.title.trim()) {
        const title = await getTitle(activeMessages).then((res) => res.title);

        await dispatch(
          updateChatTitle({
            chatId,
            title,
          })
        );
      }
    }

    setChatTitle();
  }, [
    activeMessages.length,
    activeMessages[activeMessages.length - 1]?.status,
    chatId,
    dispatch,
  ]);

  return (
    <div className="relative h-full flex flex-col">
      {/* <ChatComponent activeChatId={chatId!} /> */}
      <ChatArea />
      <ChatInput />
    </div>
  );
}

export default Chatpage;
