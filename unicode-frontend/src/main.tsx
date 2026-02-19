import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { NotificationsProvider } from "./notifications/NotificationsContext";
import { ToastProvider } from "./components/ToastProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId="568033154132-fp8d7klc9pndgheqk7jjvnt6qtcniije.apps.googleusercontent.com">
            <NotificationsProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </NotificationsProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);

