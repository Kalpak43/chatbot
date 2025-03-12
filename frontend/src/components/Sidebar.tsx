import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { v4 as uuidv4 } from "uuid";
import { createChat } from "../features/chats/chatSlice";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { chats } = useAppSelector((state) => state.chat);

  const handleCreateNew = () => {
    if (chats[chats.length - 1].messages.length > 0) {
      const id = uuidv4();
      dispatch(createChat(id));
      navigate(`/chat/${id}`);
    } else {
      const { id } = chats[chats.length - 1];
      navigate(`/chat/${id}`);
    }
  };

  return (
    <nav className="w-1/5 border-r p-4 min-h-full h-[100dvh] bg-base-200 flex flex-col">
      <div className="py-4">
        <h2 className="text-xl font-bold mb-4">Chat with AI</h2>
        <button className="btn btn-primary w-full" onClick={handleCreateNew}>
          New Chat
        </button>
      </div>
      <div className="mt-4 flex-1 flex flex-col">
        <h4 className="text-lg font-semibold mb-2">Recents:</h4>
        <ul className="menu bg-base-100 rounded-box w-full max-h-[70vh] overflow-y-auto block">
          {[...chats]
            .sort((a, b) => {
              return b.created_at - a.created_at;
            })
            .map((chat) => (
              <li key={chat.id} className="w-full">
                <Link
                  to={`/chat/${chat.id}`}
                  className="block truncate hover:text-primary w-full"
                >
                  {chat.title}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
}

export default Sidebar;
