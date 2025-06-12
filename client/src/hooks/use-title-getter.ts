import { useAppDispatch, useAppSelector } from "@/app/hooks";
import db from "@/dexie";
import { updateChat } from "@/features/chats/chatThunk";
import { getTitle } from "@/services/ai-service";
import { useEffect, useMemo } from "react";

function useTitleGetter(chatId?: string) {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chat.chats);

  const currentChat = useMemo(() => {
    return chats.find((chat) => chat.id == chatId);
  }, [chatId, chats]);

  useEffect(() => {
    async function title() {
      if (
        chatId &&
        currentChat &&
        currentChat.status == "done" &&
        !currentChat.title.trim()
      ) {
        const messages = (
          await db.messages.where("chatId").equals(chatId).toArray()
        ).filter((message) => message.status != "deleted");

        if (
          messages.length > 1 &&
          messages[messages.length - 1].status == "done"
        )
          getTitle(messages).then((res) =>
            dispatch(
              updateChat({
                chatId,
                data: {
                  title: res,
                },
              })
            )
          );
      }
    }

    title();
  }, [chatId, currentChat]);

  return {};
}

export default useTitleGetter;
