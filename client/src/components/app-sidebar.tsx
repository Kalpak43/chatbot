import {
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCw,
  Trash,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar";
import { Link, useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "./ui/button";
import { useEffect, useMemo, useState } from "react";
import { deleteChat, updateChat } from "@/features/chats/chatThunk";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import UserOptions from "./user-options";
import { useSync } from "@/hooks/use-sync";
import { AnimatePresence, motion } from "motion/react";

function AppSidebar() {
  const navigate = useNavigate();

  useSync();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="#">
                <img src="/logo.svg" alt="" className="size-9" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">J.A.C.A.</span>
                  <span className="text-xs">Just Another Chat Application</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              className="w-full"
              size="sm"
              onClick={() => navigate("/chat")}
            >
              <Plus />
              <span>New Chat</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <div className="h-full overflow-y-hidden relative">
        <SidebarContent className="h-full overflow-y-auto">
          <AnimatePresence>
            <RecentList />
          </AnimatePresence>
        </SidebarContent>
        <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-sidebar to-transparent"></div>
      </div>
      <SidebarFooter className="max-md:hidden">
        <UserOptions />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;

const RecentList = () => {
  const chats = useAppSelector((state) => state.chat.chats);
  const loading = useAppSelector((state) => state.chat.loading);

  const startOfToday = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }, []);

  const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = startOfToday - 30 * 24 * 60 * 60 * 1000;

  const groups = [
    {
      label: "Today",
      filter: (chat: ChatType) => chat.updated_at >= startOfToday,
    },
    {
      label: "Last 7 days",
      filter: (chat: ChatType) =>
        chat.updated_at >= sevenDaysAgo && chat.updated_at < startOfToday,
    },
    {
      label: "Last 30 days",
      filter: (chat: ChatType) =>
        chat.updated_at < sevenDaysAgo && chat.updated_at >= thirtyDaysAgo,
    },
    {
      label: "Older",
      filter: (chat: ChatType) => chat.updated_at < thirtyDaysAgo,
    },
  ];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.5,
        }}
        className="h-full w-full flex items-center justify-center"
      >
        <Loader2 className="animate-spin" />
      </motion.div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        No chats found
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.5,
      }}
    >
      {groups.map(({ label, filter }) => {
        const filtered = chats
          .filter(filter)
          .sort((a, b) => b.created_at - a.created_at);
        if (filtered.length === 0) return null;
        return (
          <SidebarGroup key={label}>
            <SidebarGroupLabel className="text-secondary sticky top-0 z-10 bg-sidebar font-newsreader before:content-[' '] before:absolute before:left-0 before:top-full before:h-2 before:w-full before:bg-gradient-to-b before:from-sidebar before:to-transparent">
              {label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <AnimatePresence initial={true}>
                  {filtered.map((chat) => (
                    <ChatButton key={chat.id} chat={chat} />
                  ))}
                </AnimatePresence>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </motion.div>
  );
};

// Animation variants for the chat items
const chatItemVariants = {
  initial: {
    opacity: 0,
    x: -20,
    height: 0,
    marginBottom: 0,
  },
  animate: {
    opacity: 1,
    x: 0,
    height: "auto",
    marginBottom: 4,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      height: {
        duration: 0.2,
      },
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    height: 0,
    marginBottom: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const ChatButton = ({ chat }: { chat: ChatType }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [title, setTitle] = useState(chat.title);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setTitle(chat.title);
  }, [chat.title]);

  const handleDelete = async () => {
    await dispatch(
      deleteChat({
        chatId: chat.id,
      })
    );

    navigate("/chat");
  };

  return (
    <SidebarMenuItem key={chat.id}>
      {editing ? (
        <div className="relative">
          <Input
            type="text"
            value={title}
            autoFocus
            ref={(input) => {
              if (input) input.focus();
            }}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                if (chat.title.trim() == title.trim()) {
                  setEditing(false);
                  return;
                }

                await dispatch(
                  updateChat({
                    chatId: chat.id,
                    data: {
                      title: title,
                    },
                  })
                );

                setEditing(false);
              }
            }}
            className="pr-10"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">↵</span>
            </kbd>
          </div>
        </div>
      ) : (
        <>
          <SidebarMenuButton asChild>
            <Link
              to={`/chat/${chat.id}`}
              className={cn(
                "relative group",
                location.pathname == `/chat/${chat.id}` && "bg-accent/50"
              )}
            >
              <span>{!title.trim() ? "New Chat" : title}</span>
            </Link>
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction>
                <MoreHorizontal />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem>
                <button
                  className="inline-flex items-center gap-2"
                  onClick={() => setEditing(true)}
                >
                  <Edit />
                  <span>Edit Title</span>
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  className="inline-flex items-center gap-2"
                  onClick={handleDelete}
                >
                  <Trash />
                  <span>Delete Chat</span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </SidebarMenuItem>
  );
};
