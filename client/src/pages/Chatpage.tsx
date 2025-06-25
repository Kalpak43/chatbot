import { useAppDispatch } from "@/app/hooks";
import { ChatArea } from "@/components/chat-component/chat-area";
import { ChatInput } from "@/components/chat-component/chat-input";
import { ChatIntro } from "@/components/chat-component/chat-intro";
import { setActiveChatId } from "@/features/chats/chatSlice";
import { setMessages } from "@/features/messages/messageSlice";
import { getMessages } from "@/features/messages/messageThunk";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router";

function Chatpage() {
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setActiveChatId(chatId));
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      dispatch(getMessages(chatId));
    } else dispatch(setMessages([]));
  }, [chatId]);

  return (
    <div className="w-full flex-1 overflow-y-auto flex flex-col">
      <div className="h-full overflow-y-hidden relative">
        <AnimatePresence initial>
          {query ? null : chatId ? (
            <ChatArea key={chatId} chatId={chatId} />
          ) : (
            <ChatIntro key="intro" />
          )}
        </AnimatePresence>
        <div className="absolute top-0 bg-gradient-to-b from-background to-transparent w-full h-4"></div>
        <div className="absolute bottom-0 bg-gradient-to-t from-background to-transparent w-full h-4"></div>
      </div>
      <ChatInput chatId={chatId} query={query ? query : undefined} />
    </div>
  );
}

export default Chatpage;
