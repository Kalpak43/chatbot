import { Outlet } from "react-router";
import AppSidebar from "../components/app-sidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import AppHeader from "../components/app-header";

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full md:p-0 relative h-[100dvh] flex flex-col overflow-x-hidden">
        <AppHeader />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default Layout;
