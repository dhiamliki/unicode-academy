import React, { createContext, useContext, useMemo, useState } from "react";
import type { NotificationType } from "../notifications/NotificationsContext";
import { generateId } from "../utils/id";

type Toast = {
  id: string;
  type: NotificationType;
  message: string;
};

type ShowToastInput = {
  type: NotificationType;
  message: string;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<ToastContextValue>(() => {
    function showToast(input: ShowToastInput) {
      const id = generateId("toast");
      const toast: Toast = { id, type: input.type, message: input.message };
      setToasts((prev) => [...prev, toast]);

      const duration = input.durationMs ?? 3500;
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return { showToast };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[1000] grid gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "min-w-[240px] max-w-[320px] rounded-xl border px-3 py-2 text-sm shadow-[0_12px_24px_rgba(15,23,42,0.12)]",
              t.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : t.type === "error"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : t.type === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-blue-200 bg-blue-50 text-blue-900",
            ].join(" ")}
          >
            <div className="mb-1 font-semibold">
              {t.type === "success"
                ? "Success"
                : t.type === "error"
                  ? "Error"
                  : t.type === "warning"
                    ? "Warning"
                    : "Info"}
            </div>
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
