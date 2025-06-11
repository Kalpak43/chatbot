import Chat from "@/components/chat-component";
import { useParams } from "react-router";

function Chatpage() {
  const { chatId } = useParams();

  return (
    <div>hello</div>
    // <Chat chatId={chatId ?? null}>
    //   {chatId ? <Chat.Area /> : <Chat.Intro />}
    //   <Chat.Input />
    // </Chat>
  );
}

export default Chatpage;
