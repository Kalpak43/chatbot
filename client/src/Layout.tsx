import { Outlet } from "react-router";
import AppSidebar from "./components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full md:p-4 relative max-h-screen">
        <SidebarTrigger size={"lg"} className="absolute top-0 left-0 lg:ml-4 [&_svg:not([class*='size-'])]:size-6 size-10 z-50" />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default Layout;
