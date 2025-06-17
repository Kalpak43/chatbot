import { Link } from "react-router";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { CirclePlus, PanelLeftIcon } from "lucide-react";
import useMediaQuery from "@/hooks/use-media-query";
import UserOptions from "./user-options";
import ConversationTree from "./conversation-tree";
import ExportOptions from "./export-options";

function AppHeader() {
  return (
    <>
      <div className="flex items-center justify-between gap-2 sticky md:absolute top-0 max-md:inset-x-0 left-0 py-1 max-md:px-2 md:ml-2 md:mt-1 z-50 max-md:bg-card max-md:border-b">
        <div className="flex gap-2">
          <SidebarTrigger
            size={"lg"}
            className="[&_svg:not([class*='size-'])]:size-6 size-10"
          >
            <PanelLeftIcon />
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>
          <NewChatButton />
        </div>
        <div className="md:hidden px-2">
          <UserOptions />
        </div>
      </div>

      <div className="max-md:hidden flex items-center justify-between gap-2 sticky md:absolute top-0 max-md:inset-x-0 right-0 py-1 max-md:px-2 md:mr-3 md:mt-1 z-50 max-md:bg-card max-md:border-b">
        <div className="flex gap-2">
          <ExportOptions />
          <ConversationTree />
        </div>
      </div>
    </>
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
        <CirclePlus />
        <span className="sr-only">Edit</span>
      </Link>
    </Button>
  );
}
