import {
  Check,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Sun,
} from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "./ui/button";
import { signout } from "@/features/auth/authThunk";
import { toast } from "sonner";
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
import useMediaQuery from "@/hooks/use-media-query";
import { useEffect } from "react";
import { checkLimit } from "@/services/ai-service";
import { useTheme } from "@/hooks/use-theme";

const UserOptions = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const rateLimit = useAppSelector((state) => state.prompt.rateLimit);
  const dispatch = useAppDispatch();

  const { theme, setTheme } = useTheme();

  const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
    { name: "System", value: "system", icon: Monitor },
  ];

  useEffect(() => {
    checkLimit();
  }, [user]);

  return (
    <>
      {user ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative max-md:h-7 max-md:w-7"
              >
                <Avatar className="h-7 w-7 rounded-full outline outline-primary/40">
                  <AvatarImage
                    src={user.photoURL! || "/placeholder.svg"}
                    alt={user.displayName!}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-center max-md:hidden">
                  {user.displayName}
                </span>
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
                  {rateLimit && (
                    <p className="text-xs leading-none text-muted-foreground">
                      Remaining Chats:{" "}
                      <span>
                        {rateLimit?.remaining} / {rateLimit?.limit}
                      </span>
                    </p>
                  )}
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
                <span className="">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Button
          variant="outline"
          size={isMobile ? "icon" : "sm"}
          className="border-green-400"
          asChild
        >
          <Link to="/login">
            <LogIn />
            <span className="max-md:hidden">Login</span>
          </Link>
        </Button>
      )}
    </>
  );
};

export default UserOptions;
