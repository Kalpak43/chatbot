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
      {chatId ? <ChatArea chatId={chatId} /> : <ChatIntro />}
      <ChatInput chatId={chatId} />
    </div>
  );
}

export default Chatpage;
