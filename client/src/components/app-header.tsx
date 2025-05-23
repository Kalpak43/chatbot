import { Link } from "react-router";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Edit } from "lucide-react";
import useMediaQuery from "@/hooks/use-media-query";

function AppHeader() {
  return (
    <div className="flex items-center gap-2 sticky md:absolute top-0 max-md:inset-x-0 left-0 py-1 max-md:px-2 md:ml-4 md:mt-2 z-50 bg-background max-md:border-b">
      <SidebarTrigger
        size={"lg"}
        className="[&_svg:not([class*='size-'])]:size-6 size-10"
      />
      <NewChatButton />
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
