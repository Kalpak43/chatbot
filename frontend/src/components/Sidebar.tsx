import { Link, useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { v4 as uuidv4 } from "uuid";
import { createChat, deleteChat } from "../features/chats/chatSlice";
import { Loader2, Menu, X } from "lucide-react";
import { useState } from "react";
import { signout } from "../features/auth/authThunk";
import { useToast } from "../hooks/useToast";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { chats } = useAppSelector((state) => state.chat);
  const { user, loading } = useAppSelector((state) => state.auth);
  const [hide, setHide] = useState(true);
  const { showToast } = useToast();

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
    <>
      <button
        className="btn btn-soft btn-primary fixed top-0 left-0 z-40 m-2"
        onClick={() => setHide((x) => !x)}
      >
        <Menu />
      </button>
      <nav
        className={`relative max-md:fixed max-md:inset-y-0 max-md:left-0 z-50 w-4/5 md:w-1/5 border-r p-4 min-h-full h-[100dvh] bg-base-200 flex flex-col transition-all duration-300 ${
          hide ? "max-md:-translate-x-full" : ""
        }`}
      >
        <div className="py-4">
          <h2 className="text-xl font-bold mb-4">Chat with AI</h2>
          <button className="btn btn-primary w-full" onClick={handleCreateNew}>
            New Chat
          </button>
        </div>
        <div className="mt-4 flex-1 flex flex-col">
          <h4 className="text-lg font-semibold mb-2">Recents:</h4>
          <ul className="menu bg-base-100 rounded-box w-full h-full max-h-[70vh] overflow-y-auto block">
            <Recents />
          </ul>
        </div>
        <div className="mt-4">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="avatar">
                <div className="ring-primary ring-offset-base-100 w-8 rounded-full ring ring-offset-2">
                  <img src={user.profilePicture || "/default.webp"} />
                </div>
              </div>
              <button
                onClick={async () => {
                  await dispatch(signout());
                  showToast("Signed out successfully", "success");
                }}
                className="flex-1 btn btn-outline btn-error"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Sign out"}
              </button>
            </div>
          ) : (
            <Link to={"/login"} className="w-full btn btn-outline btn-success">
              Login
            </Link>
          )}
        </div>

        {!hide && (
          <button
            className="btn btn-circle border border-primary absolute top-0 left-full z-40 m-2"
            onClick={() => setHide((x) => !x)}
          >
            <X />
          </button>
        )}
      </nav>
    </>
  );
}

export default Sidebar;

const Recents = () => {
  const { chats } = useAppSelector((state) => state.chat);

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        No chats Found
      </div>
    );
  }

  return (
    <>
      {[...chats]
        .sort((a, b) => {
          return b.created_at - a.created_at;
        })
        .map((chat) => (
          <li key={chat.id} className="w-full">
            <ChatButton chat={chat} />
          </li>
        ))}
    </>
  );
};

const ChatButton = ({ chat }: { chat: ChatType }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { chats } = useAppSelector((state) => state.chat);

  return (
    <Link
      to={`/chat/${chat.id}`}
      className={`relative block truncate hover:text-primary w-full px-4 py-2 rounded ${
        location.pathname === `/chat/${chat.id}`
          ? "bg-neutral text-primary"
          : ""
      }`}
    >
      {chat.title}
      <button
        className="absolute cursor-pointer inset-y-0 right-0 mr-2 text-neutral-content hover:text-red-400"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          dispatch(deleteChat(chat.id));

          if (chats.length > 1) {
            navigate(`/chat/${chats[chats.length - 2].id}`);
          } else {
            const id = uuidv4();
            dispatch(createChat(id));
            navigate(`/chat/${id}`);
          }
        }}
      >
        <X size={12} />
      </button>
    </Link>
  );
};
