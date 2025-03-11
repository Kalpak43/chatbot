import { useParams } from "react-router";
import ChatComponent from "../components/ChatComponent";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useEffect } from "react";
import { setActiveChat } from "../features/chats/chatSlice";

function Chatpage() {
  const { chatId } = useParams();

  const dispatch = useAppDispatch();

  const chats = useAppSelector((state) => state.chat.chats);
  useEffect(() => {
    console.log(
      "ChAT:",
      chats.find((c) => c.id === chatId)
    );
  }, []);

  //   useEffect(() => {
  //     if (chatId) {
  //       dispatch(setActiveChat(chatId));
  //     }
  //   }, [dispatch, chatId]);

  return (
    <main>
      <ChatComponent activeChatId={chatId} />
    </main>
  );
}

export default Chatpage;
