import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "./session";

export default function PublicOnlyRoute() {
  const token = getToken();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
