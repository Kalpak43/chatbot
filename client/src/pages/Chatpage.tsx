import Chat from "@/components/chat-component-2";
import { useParams } from "react-router";

function Chatpage() {
  const { chatId } = useParams();

  return <Chat chatId={chatId} />;
}

export default Chatpage;
