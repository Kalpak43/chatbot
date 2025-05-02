import Chat from "@/components/chat-component";
import { useParams } from "react-router";

function Chatpage() {
  const { chatId } = useParams();

  return (
    <Chat chatId={chatId ?? null}>
      <Chat.Area />
      <Chat.Input />
    </Chat>
  );
}

export default Chatpage;
