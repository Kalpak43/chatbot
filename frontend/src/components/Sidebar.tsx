import { Link, useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Loader2, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { signout } from "../features/auth/authThunk";
import { useToast } from "../hooks/useToast";
import { deleteChatAndMessages, getChats } from "../features/chats/chatThunk";
import axios from "axios";
import { auth } from "../firebase";

const API_URL = import.meta.env.VITE_API_URL;

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [hide, setHide] = useState(true);
  const { showToast } = useToast();

  const handleCreateNew = () => {
    // if (chats[chats.length - 1].messages.length > 0) {
    //   const id = uuidv4();
    //   dispatch(createChat(id));
    //   navigate(`/chat/${id}`);
    // } else {
    //   const { id } = chats[chats.length - 1];
    //   navigate(`/chat/${id}`);
    // }

    navigate("/chat");
  };

  return (
    <>
      <button
        className="glass-button btn btn-soft btn-primary fixed top-0 left-0 z-40 m-2"
        onClick={() => setHide((x) => !x)}
      >
        <Menu />
      </button>
      <nav
        className={`glass-nav max-lg:fixed inset-y-0 left-0 z-50 w-3/4 md:w-1/3 lg:w-1/4 xl:w-1/6  border-r border-white/20 p-4 min-h-full h-[100dvh] flex flex-col transition-all duration-300 ${
          hide ? "max-lg:-translate-x-full" : ""
        }`}
      >
        <div className="py-4">
          <h2 className="text-xl font-bold mb-4">Chat with AI</h2>
          <button
            className="btn btn-sm btn-primary w-full"
            onClick={handleCreateNew}
          >
            New Chat
          </button>
        </div>
        <div className="mt-4 flex-1 flex flex-col">
          <h4 className="text-lg font-semibold mb-2">Recents:</h4>

          <Recents />
        </div>
        <div className="mt-4">
          <button
            className="w-full btn btn-soft btn-secondary my-4"
            onClick={async () => {
              const idToken = await auth.currentUser?.getIdToken();
              if (idToken) {
                const res = await axios.get(`${API_URL}/secret`, {
                  headers: {
                    Authorization: `Bearer ${idToken}`,
                  },
                });

                alert(`SECRET: ${res.data}`);
              } else alert("Log in to view secret");
            }}
          >
            SECRET
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="avatar">
                <div className="ring-primary ring-offset-base-100 w-6 rounded-full ring ring-offset-2">
                  <img src={user.photoURL || "/default.webp"} />
                </div>
              </div>
              <button
                onClick={async () => {
                  await dispatch(signout());
                  showToast("Signed out successfully", "success");
                }}
                className="flex-1 btn btn-outline btn-error  btn-sm"
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
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chat.chats);

  useEffect(() => {
    dispatch(getChats());
  }, [dispatch]);

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white/70">
        No chats found
      </div>
    );
  }

  return (
    <ul className="glass-list w-full h-full flex-1 overflow-y-auto block text-sm">
      {[...chats]
        .sort((a, b) => {
          return b.created_at - a.created_at;
        })
        .map((chat) => (
          <li key={chat.id} className="w-full mb-1">
            <ChatButton chat={chat} />
          </li>
        ))}
    </ul>
  );
};

const ChatButton = ({ chat }: { chat: ChatType }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Link
      to={`/chat/${chat.id}`}
      className={`relative block truncate hover:text-primary w-full px-4 py-2 rounded-lg ${
        location.pathname === `/chat/${chat.id}`
          ? "bg-neutral/50 text-primary"
          : ""
      }`}
    >
      {!!chat.title.trim() ? chat.title : "New Chat"}
      <button
        className="absolute cursor-pointer inset-y-0 right-0 mr-2 text-neutral-content hover:text-red-400"
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();

          await dispatch(
            deleteChatAndMessages({
              chatId: chat.id,
            })
          );

          navigate("/chat");
        }}
      >
        <X size={12} />
      </button>
    </Link>
  );
};
