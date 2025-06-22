import { useAppSelector } from "@/app/hooks";
import { Loader2 } from "lucide-react";
import { Outlet, useNavigate } from "react-router";

function ProctectedRoute() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);

  if (loading)
    return (
      <main className="flex items-center justify-center min-h-svh">
        <Loader2 className="animate-spin" />
      </main>
    );

  if (!user) navigate("/chat");

  return <Outlet />;
}

export default ProctectedRoute;
