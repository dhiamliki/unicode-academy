import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import "./styles/design-system.css";
import { queryClient } from "./lib/queryClient";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

const appTree = (
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#1a2336",
          color: "#e8ecf4",
          border: "1px solid #2a3a55",
          borderRadius: "14px",
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 600,
          fontSize: "14px",
        },
        success: {
          iconTheme: { primary: "#00c9a7", secondary: "#071a14" },
        },
        error: {
          iconTheme: { primary: "#f87171", secondary: "#fff" },
        },
        duration: 3000,
      }}
    />
  </QueryClientProvider>
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
