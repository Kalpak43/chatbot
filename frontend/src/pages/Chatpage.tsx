import { useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useEffect } from "react";
import db from "../db";
import { getTitle } from "../utils";
import { updateChatTitle } from "../features/chats/chatThunk";
import { ChatInput } from "../components/ChatComponent";

function Chatpage() {
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
      {/* <ChatComponent activeChatId={chatId!} /> */}
      <ChatInput />
    </div>
  );
}

export default Chatpage;
