import { Link } from "react-router";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Check, Edit, LogIn, Monitor, Moon, Palette, Sun } from "lucide-react";
import useMediaQuery from "@/hooks/use-media-query";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signout } from "@/features/auth/authThunk";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";

function AppHeader() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const { theme, setTheme } = useTheme();

  const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
    { name: "System", value: "system", icon: Monitor },
  ];

  return (
    <div className="flex items-center justify-between gap-2 sticky md:absolute top-0 max-md:inset-x-0 left-0 py-1 max-md:px-2 md:ml-2 md:mt-1 z-50 max-md:bg-card max-md:border-b">
      <div className="flex gap-2">
        <SidebarTrigger
          size={"lg"}
          className="[&_svg:not([class*='size-'])]:size-6 size-10"
        />
        <NewChatButton />
      </div>
      <div className="md:hidden px-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 rounded-full outline outline-primary/40">
                <AvatarImage src={user.photoURL!} alt={user.displayName!} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <button
                    className="w-full"
                    onClick={async () => {
                      await dispatch(signout());
                      // showToast("Signed out successfully", "success");
                      toast.success("Signed Out", {
                        description: "Signed out successfully",
                      });
                    }}
                  >
                    Sign Out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size={"icon"}
            className="border-green-400"
            asChild
          >
            <Link to="/login">
              <LogIn />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default AppHeader;

function NewChatButton() {
  const { state } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (state === "expanded" && !isMobile) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="lg"
      className="[&_svg:not([class*='size-'])]:size-6 size-10"
      asChild
    >
      <Link to="/chat">
        <Edit />
        <span className="sr-only">Edit</span>
      </Link>
    </Button>
  );
}
