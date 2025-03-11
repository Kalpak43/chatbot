import { useParams } from "react-router";
import ChatComponent from "../components/ChatComponent";

function Chatpage() {
  const { chatId } = useParams();

  return (
    <main>
      <ChatComponent activeChatId={chatId!} />
    </main>
  );
}

export default Chatpage;
