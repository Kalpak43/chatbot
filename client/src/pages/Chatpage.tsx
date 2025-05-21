import Chat from "@/components/chat-component";
import { useParams } from "react-router";

function Chatpage() {
  const { chatId } = useParams();

  return (
    <Chat chatId={chatId ?? null}>
      {chatId ? <Chat.Area /> : <Chat.Intro />}
      <Chat.Input />
    </Chat>
  );
}

export default Chatpage;
