import { Link, Outlet } from "react-router";
import AppSidebar from "./components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "./components/ui/sidebar";
import { Button } from "./components/ui/button";
import { Edit } from "lucide-react";

function NewChatButton() {
  const { state } = useSidebar();

  if (state === "expanded") {
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

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full md:p-4 relative max-h-screen">
        <div className="flex items-center gap-2 absolute top-0 left-0 lg:ml-4 mt-2 z-50">
          <SidebarTrigger
            size={"lg"}
            className="[&_svg:not([class*='size-'])]:size-6 size-10"
          />
          <NewChatButton />
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default Layout;
