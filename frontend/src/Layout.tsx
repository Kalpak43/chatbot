import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router";

function Layout() {
  return (
    <div
      className="flex min-h-[100dvh] overflow-hidden"
    >
      <Sidebar />
      <main className="flex-1 min-h-full max-h-[100dvh] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
