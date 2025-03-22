import { useParams } from "react-router";
import ChatComponent from "../components/ChatComponent";

function Chatpage() {
  const { chatId } = useParams();

  return (
    <>
      <ChatComponent activeChatId={chatId!} />
    </>
  );
}

export default Chatpage;
