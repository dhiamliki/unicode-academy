import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { NotificationsProvider } from "./notifications/NotificationsContext";
import { ToastProvider } from "./components/ToastProvider";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

const appTree = (
  <NotificationsProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </NotificationsProvider>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider>
    ) : (
      appTree
    )}
  </React.StrictMode>
);
