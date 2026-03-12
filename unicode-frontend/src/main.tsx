import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { NotificationsProvider } from "./notifications/NotificationsContext";
import { ToastProvider } from "./components/ToastProvider";
import "./index.css";

const DEFAULT_GOOGLE_CLIENT_ID =
  "568033154132-fp8d7klc9pndgheqk7jjvnt6qtcniije.apps.googleusercontent.com";
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? DEFAULT_GOOGLE_CLIENT_ID;

const appTree = (
  <NotificationsProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </NotificationsProvider>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider>
  </React.StrictMode>
);
