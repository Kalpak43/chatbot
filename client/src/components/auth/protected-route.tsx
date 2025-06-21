import { useAppSelector } from "@/app/hooks";
import { Outlet, useNavigate } from "react-router";

function ProctectedRoute() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) navigate("/chat");

  return <Outlet />;
}

export default ProctectedRoute;
