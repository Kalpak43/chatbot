import { Link } from "react-router";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Edit, LogIn } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signout } from "@/features/auth/authThunk";
import { toast } from "sonner";

function AppHeader() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex items-center justify-between gap-2 sticky md:absolute top-0 max-md:inset-x-0 left-0 py-1 max-md:px-2 md:ml-4 md:mt-2 z-50 bg-background max-md:border-b">
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
