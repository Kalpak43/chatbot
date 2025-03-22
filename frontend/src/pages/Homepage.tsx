import { useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useEffect } from "react";
import { createChat } from "../features/chats/chatSlice";
import { v4 as uuidv4 } from "uuid";

function Homepage() {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { chats } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (chats.length > 0) {
      if (chats[chats.length - 1].messages.length === 0) {
        navigate(`/chat/${chats[chats.length - 1].id}`);
      } else {
        const id = uuidv4();
        dispatch(createChat(id));
        navigate(`/chat/${id}`);
      }
    } else {
      const id = uuidv4();
      dispatch(createChat(id));
      navigate(`/chat/${id}`);
    }
  }, []);

  return (
    <main>
      {/* <ChatComponent /> */}
      <Sidebar />
    </main>
  );
}

export default Homepage;
