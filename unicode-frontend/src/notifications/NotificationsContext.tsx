import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { generateId } from "../utils/id";

export type NotificationType = "success" | "error" | "info" | "warning";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  read: boolean;
  selected: boolean;
};

type AddNotificationInput = {
  type: NotificationType;
  message: string;
  createdAt?: string;
  read?: boolean;
};

type NotificationsContextValue = {
  notifications: NotificationItem[];
  addNotification: (input: AddNotificationInput) => void;
  markAllRead: () => void;
  clearAll: () => void;
  deleteMany: (ids: string[]) => void;
  toggleRead: (id: string) => void;
  toggleSelected: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);
const STORAGE_KEY = "notifications";

function loadFromStorage(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NotificationItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((n) => ({
      ...n,
      read: Boolean(n.read),
      selected: Boolean(n.selected),
    }));
  } catch {
    return [];
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage()
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const value = useMemo<NotificationsContextValue>(() => {
    function addNotification(input: AddNotificationInput) {
      const next: NotificationItem = {
        id: generateId("notif"),
        type: input.type,
        message: input.message,
        createdAt: input.createdAt ?? new Date().toISOString(),
        read: input.read ?? false,
        selected: false,
      };
      setNotifications((prev) => [next, ...prev]);
    }

    function markAllRead() {
      setNotifications((prev) =>
        prev.map((n) => (n.read ? n : { ...n, read: true }))
      );
    }

    function clearAll() {
      setNotifications([]);
    }

    function deleteMany(ids: string[]) {
      if (ids.length === 0) return;
      const idSet = new Set(ids);
      setNotifications((prev) => prev.filter((n) => !idSet.has(n.id)));
    }

    function toggleRead(id: string) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
      );
    }

    function toggleSelected(id: string) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, selected: !n.selected } : n))
      );
    }

    return {
      notifications,
      addNotification,
      markAllRead,
      clearAll,
      deleteMany,
      toggleRead,
      toggleSelected,
    };
  }, [notifications]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}

