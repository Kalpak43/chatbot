import {
  Check,
  Edit,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  MoreHorizontal,
  Palette,
  Plus,
  Sun,
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
import { deleteChat, updateChat } from "@/features/chats/chatThunk";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

function AppSidebar() {
  const navigate = useNavigate();

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

      <div className="h-full overflow-y-hidden relative">
        <SidebarContent className="h-full overflow-y-auto">
          <RecentList />
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

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        No chats found
      </div>
    );
  }

  return (
    <>
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
                {filtered.map((chat) => (
                  <ChatButton key={chat.id} chat={chat} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
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

const UserOptions = () => {
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const dispatch = useAppDispatch();

  const { theme, setTheme } = useTheme();

  const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
    { name: "System", value: "system", icon: Monitor },
  ];

  return (
    <>
      {user ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative">
                <Avatar className="h-7 w-7 rounded-full outline outline-primary/40">
                  <AvatarImage
                    src={user.photoURL! || "/placeholder.svg"}
                    alt={user.displayName!}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-center">{user.displayName}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="mr-2 h-4 w-4" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {themes.map((themeOption) => {
                    const Icon = themeOption.icon;
                    return (
                      <DropdownMenuItem
                        key={themeOption.value}
                        onClick={() => setTheme(themeOption.value as Theme)}
                        className="cursor-pointer"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{themeOption.name}</span>
                        {theme === themeOption.value && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={async () => {
                  await dispatch(signout());
                  // showToast("Signed out successfully", "success");
                  toast.success("Signed Out", {
                    description: "Signed out successfully",
                  });
                }}
                className="cursor-pointer text-red-600 hover:text-red-400 focus:text-red-600"
                disabled={loading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
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
    </>
  );
};
