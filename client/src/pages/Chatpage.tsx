import { useAppDispatch } from "@/app/hooks";
import { ChatArea } from "@/components/chat-component/chat-area";
import { ChatInput } from "@/components/chat-component/chat-input";
import { ChatIntro } from "@/components/chat-component/chat-intro";
import { setActiveChatId } from "@/features/chats/chatSlice";
import { useEffect } from "react";
import { useParams } from "react-router";

function Chatpage() {
  const { chatId } = useParams();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setActiveChatId(chatId));
  }, [chatId]);

  return (
    <div className="w-full flex-1 overflow-y-auto flex flex-col">
      <div className="h-full overflow-y-hidden relative">
        {chatId ? <ChatArea chatId={chatId} /> : <ChatIntro />}
        <div className="absolute top-0 bg-gradient-to-b from-background to-transparent w-full h-4"></div>
        <div className="absolute bottom-0 bg-gradient-to-t from-background to-transparent w-full h-4"></div>
      </div>
      <ChatInput chatId={chatId} />
    </div>
  );
}

export default Chatpage;
