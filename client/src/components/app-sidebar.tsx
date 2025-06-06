import {
  Edit,
  Loader2,
  LogIn,
  MoreHorizontal,
  Plus,
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "./ui/button";
import { signout } from "@/features/auth/authThunk";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import {
  deleteChatAndMessages,
  getChats,
  updateChat,
} from "@/features/chat/chatThunk";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

function AppSidebar() {
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const dispatch = useAppDispatch();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="#">
                <img src="/logo.svg" alt="" className="size-10" />
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

      <SidebarContent className="overflow-y-auto">
        <RecentList />
      </SidebarContent>
      <SidebarFooter className="max-md:hidden">
        {user ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-full outline outline-primary/40">
              <AvatarImage src={user.photoURL!} alt={user.displayName!} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>

            <Button
              variant={"destructive"}
              size={"sm"}
              className="flex-1 "
              onClick={async () => {
                await dispatch(signout());
                // showToast("Signed out successfully", "success");
                toast.success("Signed Out", {
                  description: "Signed out successfully",
                });
              }}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign out"}
              {/* Added margin to icon */}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size={"sm"}
            className="border-green-400"
            asChild
          >
            <Link to="/login">
              <LogIn />
              Login
            </Link>
          </Button>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;

const RecentList = () => {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chat.chats);

  const now = Date.now() - 1 * 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const today = useMemo(
    () => chats.filter((chat) => chat.updated_at >= now),
    [chats]
  );

  const last7Days = useMemo(
    () =>
      chats.filter(
        (chat) => chat.updated_at >= sevenDaysAgo && chat.updated_at < now
      ),
    [chats]
  );

  const last30Days = useMemo(
    () =>
      chats.filter(
        (chat) =>
          chat.updated_at < sevenDaysAgo && chat.updated_at >= thirtyDaysAgo
      ),
    [chats]
  );

  const older = useMemo(
    () => chats.filter((chat) => chat.updated_at < thirtyDaysAgo),
    [chats]
  );

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
    <>
      {today.length > 0 && (
        <SidebarGroup className="">
          <SidebarGroupLabel className="text-secondary sticky top-0 z-10 bg-sidebar font-newsreader">
            Today
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Last 7 days */}
              {today
                .sort((a, b) => b.created_at - a.created_at)
                .map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <ChatButton chat={chat} />
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {last7Days.length > 0 && (
        <SidebarGroup className="">
          <SidebarGroupLabel className="text-secondary sticky top-0 z-10 bg-sidebar font-newsreader">
            Last 7 days
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Last 7 days */}
              {last7Days
                .sort((a, b) => b.created_at - a.created_at)
                .map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <ChatButton chat={chat} />
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {last30Days.length > 0 && (
        <SidebarGroup className="">
          <SidebarGroupLabel className="text-secondary sticky top-0 z-10 bg-sidebar font-newsreader">
            Last 30 days
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Last 30 days */}
              {last30Days
                .sort((a, b) => b.created_at - a.created_at)
                .map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <ChatButton chat={chat} />
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {older.length > 0 && (
        <SidebarGroup className="">
          <SidebarGroupLabel className="text-secondary sticky top-0 z-10 bg-sidebar font-newsreader">
            Older
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Older */}
              {older
                .sort((a, b) => b.created_at - a.created_at)
                .map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <ChatButton chat={chat} />
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
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
      deleteChatAndMessages({
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
