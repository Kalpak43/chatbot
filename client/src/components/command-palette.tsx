import {
  Hash,
  MessageSquare,
  Monitor,
  Moon,
  Plus,
  Search,
  Settings2,
  Sun,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "./ui/button";
import { setPrompt } from "@/features/prompt/promptSlice";
import { useTheme } from "@/hooks/use-theme";

const routes = [
  {
    id: "chats",
    title: "Chats",
    path: "/chat",
    icon: Plus,
    description: "Start a New chat",
  },
  {
    id: "peronsalization",
    title: "Peronsalization",
    path: "/settings/personalization",
    icon: Settings2,
    description: "Personalization settings",
  },
  {
    id: "contact-us",
    title: "Contact Us",
    path: "/settings/contact-us",
    icon: Settings2,
    description: "Contact us for support",
  },
];

const themeOptions = [
  {
    id: "light",
    title: "Light Theme",
    value: "light",
    icon: Sun,
    description: "Switch to light mode",
  },
  {
    id: "dark",
    title: "Dark Theme",
    value: "dark",
    icon: Moon,
    description: "Switch to dark mode",
  },
  {
    id: "system",
    title: "System Theme",
    value: "system",
    icon: Monitor,
    description: "Use system preference",
  },
];

interface CommandPaletteProps {
  chats?: ChatType[]; // Optional prop to pass chats directly
  onNavigate?: (path: string) => void;
  onSelectChat?: (chatId: string) => void;
}

function CommandPalette({
  onNavigate = (path) => console.log("Navigate to:", path),
  onSelectChat = (chatId) => console.log("Select chat:", chatId),
}: CommandPaletteProps) {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chat.chats) || [];
  const { theme, setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleRouteSelect = (route: (typeof routes)[0]) => {
    setOpen(false);
    onNavigate(route.path);
  };

  const handleChatSelect = (chat: ChatType) => {
    setOpen(false);
    onSelectChat(chat.id);
  };

  const handleThemeSelect = (themeValue: string) => {
    setTheme(themeValue as "light" | "dark" | "system");
    setOpen(false);
  };

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return "";
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search routes and chats..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Routes">
            {routes.map((route) => {
              const Icon = route.icon;
              return (
                <CommandItem
                  key={route.id}
                  value={`${route.title} ${route.description} ${route.path}`}
                  onSelect={() => handleRouteSelect(route)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{route.title}</span>
                    <span className="text-xs hover:text-accent-foreground">
                      {route.description}
                    </span>
                  </div>
                  <div className="ml-auto text-xs hover:text-accent-foreground">
                    {route.path}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Recent Chats">
            {chats.map((chat) => (
              <CommandItem
                key={chat.id}
                value={`${chat.title} ${chat.id}`}
                onSelect={() => handleChatSelect(chat)}
                className="flex items-start gap-2"
              >
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{chat.title}</span>
                    <span className="text-xs hover:text-accent-foreground ml-2 flex-shrink-0">
                      {formatTimestamp(new Date(chat.last_message_at))}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            {themeOptions.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.value;
              return (
                <CommandItem
                  key={themeOption.id}
                  value={`${themeOption.title} ${themeOption.description}`}
                  onSelect={() => handleThemeSelect(themeOption.value)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{themeOption.title}</span>
                    <span className="text-xs hover:text-accent-foreground">
                      {themeOption.description}
                    </span>
                  </div>
                  {isActive && (
                    <div className="ml-auto text-xs text-primary font-medium">
                      Active
                    </div>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>

          {search && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem
                  onSelect={() => {
                    onNavigate(`/chat?q=${encodeURIComponent(search)}`);
                    dispatch(setPrompt(search));
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  <Hash className="h-4 w-4" />
                  <span>Create new chat about "{search}"</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default CommandPalette;
