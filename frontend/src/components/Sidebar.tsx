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
    <nav className="w-1/6 border-r p-4 divide-y-1 divide-gray-400 min-h-full h-[100dvh] overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Chat with AI</h2>
      <button
        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
        onClick={handleCreateNew}
      >
        New Chat
      </button>
      <div className=" divide-y-1 divide-gray-200">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Recents:</h4>
        {chats.map((chat) => {
          return (
            <Link
              to={`/chat/${chat.id}`}
              className="block p-2 mb-2 text-gray-800 no-underlinebg-gray-100 rounded hover:bg-gray-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <span className="line-clamp-1">{chat.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default Sidebar;
