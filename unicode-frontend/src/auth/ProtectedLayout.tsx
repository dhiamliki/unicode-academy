import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "./session";
import ChatWidget from "../components/ChatWidget";
import AppShell from "../components/AppShell";

export default function ProtectedLayout() {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <ChatWidget />
    </>
  );
}

