import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import { getToken } from "../auth/session";
import { http } from "../api/http";
import { getCurrentUser, getUsernames } from "../api/users";
import { useNotifications } from "../notifications/NotificationsContext";

type ChatMessage = {
  id: number;
  userId: number;
  username: string;
  senderEmail: string;
  senderRole?: "ADMIN" | "USER" | string;
  attachmentUrl?: string;
  attachmentName?: string;
  content: string;
  roomType?: "GLOBAL" | "COURSE";
  courseId?: number | null;
  createdAt: string;
};

type RealtimeNotification = {
  type?: "success" | "error" | "info" | "warning" | string;
  message?: string;
  event?: string;
  courseId?: number;
  attachmentName?: string;
  createdAt?: string;
};

type ImagePreviewEntry = {
  url: string;
  expiresAt: number;
};

type ChatRoom =
  | { kind: "global" }
  | { kind: "course"; courseId: number };

type MentionState = {
  atIndex: number;
  cursorIndex: number;
  query: string;
};

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:8081").replace(
  /\/$/,
  ""
);
const wsBaseUrl = (import.meta.env.VITE_WS_URL ?? apiBaseUrl).replace(/\/$/, "");

export default function ChatWidget() {
  const { addNotification } = useNotifications();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<Record<string, ImagePreviewEntry>>({});
  const [room, setRoom] = useState<ChatRoom>({ kind: "global" });
  const [currentUsername, setCurrentUsername] = useState("");
  const [mentionUsernames, setMentionUsernames] = useState<string[]>([]);
  const [mentionState, setMentionState] = useState<MentionState | null>(null);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);

  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const notificationsSubscriptionRef = useRef<StompSubscription | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const openRef = useRef(open);
  const roomRef = useRef(room);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const maxFileSizeBytes = 10 * 1024 * 1024;
  const imagePreviewTtlMs = 15 * 60 * 1000;

  const currentCourseId = useMemo(() => {
    const match = location.pathname.match(/^\/courses\/(\d+)$/);
    if (!match) return null;
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }, [location.pathname]);

  const roomKey = useMemo(
    () => (room.kind === "global" ? "global" : `course:${room.courseId}`),
    [room]
  );

  const currentUserEmail = useMemo(() => {
    const token = getToken();
    if (!token) return "";
    try {
      const decoded = jwtDecode<Record<string, unknown>>(token);
      const sub = decoded?.sub;
      const email = decoded?.email;
      if (typeof sub === "string" && sub) return sub;
      if (typeof email === "string" && email) return email;
      return "";
    } catch {
      return "";
    }
  }, []);

  const mentionOptions = useMemo(() => {
    if (!mentionState) return [];
    const query = mentionState.query.toLowerCase();
    return mentionUsernames
      .filter((name) => {
        const normalized = name.trim().toLowerCase();
        if (!normalized) return false;
        if (!query) return true;
        return normalized.includes(query);
      })
      .slice(0, 8);
  }, [mentionState, mentionUsernames]);

  useEffect(() => {
    let cancelled = false;

    async function loadMentionDirectory() {
      try {
        const [me, usernames] = await Promise.all([getCurrentUser(), getUsernames()]);
        if (cancelled) return;
        const merged = uniqueUsernames([me.username, ...usernames]);
        setCurrentUsername(me.username ?? "");
        setMentionUsernames(merged);
      } catch {
        // ignore mention directory failures
      }
    }

    loadMentionDirectory();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    if (!currentCourseId && room.kind === "course") {
      setRoom({ kind: "global" });
      return;
    }
    if (currentCourseId && room.kind === "course" && room.courseId !== currentCourseId) {
      setRoom({ kind: "course", courseId: currentCourseId });
    }
  }, [currentCourseId, room]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        setConnected(true);
        subscribeToRoom(client, roomRef.current);
        subscribeToNotifications(client);
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onWebSocketError: () => setConnected(false),
      onStompError: () => setConnected(false),
      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (notificationsSubscriptionRef.current) {
        notificationsSubscriptionRef.current.unsubscribe();
        notificationsSubscriptionRef.current = null;
      }
      client.deactivate();
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    const client = clientRef.current;
    if (!client || !client.connected) return;
    subscribeToRoom(client, room);
    setMessages([]);
  }, [roomKey]);

  useEffect(() => {
    openRef.current = open;
    if (!open) return;
    setUnread(0);
    setHistoryLoading(true);
    setMessages([]);

    let cancelled = false;
    (async () => {
      try {
        const url =
          room.kind === "global"
            ? "/api/chat/messages?limit=50"
            : `/api/chat/messages?limit=50&courseId=${room.courseId}`;
        const res = await http.get<ChatMessage[]>(url);
        if (!cancelled) {
          setMessages(res.data);
        }
      } catch {
        // ignore history fetch failures
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, roomKey, room]);

  useEffect(() => {
    if (messages.length === 0) return;
    setMentionUsernames((prev) =>
      uniqueUsernames([...prev, ...messages.map((message) => message.username)])
    );
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const el = messagesRef.current;
    if (el && el.lastElementChild instanceof HTMLElement) {
      el.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, open]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      Object.values(imagePreviews).forEach((entry) => URL.revokeObjectURL(entry.url));
    };
  }, [imagePreviews]);

  useEffect(() => {
    if (messages.length === 0) return;
    const candidates = messages.filter((m) => {
      if (!m.attachmentUrl || !m.attachmentName) return false;
      const key = m.attachmentUrl;
      return !imagePreviews[key] && isImageFile(m.attachmentName);
    });

    if (candidates.length === 0) return;

    let cancelled = false;
    candidates.forEach(async (message) => {
      if (!message.attachmentUrl) return;
      try {
        const url = resolveAttachmentUrl(message.attachmentUrl);
        const res = await http.get(url, { responseType: "blob" });
        if (cancelled) return;
        if (!res.data || !res.data.type.startsWith("image/")) return;
        const blobUrl = URL.createObjectURL(res.data);
        const key = message.attachmentUrl;
        setImagePreviews((prev) => {
          if (prev[key]) {
            URL.revokeObjectURL(blobUrl);
            return prev;
          }
          return {
            ...prev,
            [key]: { url: blobUrl, expiresAt: Date.now() + imagePreviewTtlMs },
          };
        });
      } catch {
        // ignore preview failures
      }
    });

    return () => {
      cancelled = true;
    };
  }, [messages, imagePreviews]);

  function subscribeToRoom(client: Client, targetRoom: ChatRoom) {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    const topic =
      targetRoom.kind === "global"
        ? "/topic/chat/global"
        : `/topic/chat/course/${targetRoom.courseId}`;
    subscriptionRef.current = client.subscribe(topic, (msg) => {
      const parsed: ChatMessage = JSON.parse(msg.body);
      setMessages((prev) => [...prev, parsed].slice(-200));
      if (!openRef.current) {
        setUnread((count) => count + 1);
      }
    });
  }

  function subscribeToNotifications(client: Client) {
    if (notificationsSubscriptionRef.current) {
      notificationsSubscriptionRef.current.unsubscribe();
      notificationsSubscriptionRef.current = null;
    }

    notificationsSubscriptionRef.current = client.subscribe("/topic/notifications", (msg) => {
      let payload: RealtimeNotification | null = null;
      try {
        payload = JSON.parse(msg.body) as RealtimeNotification;
      } catch {
        payload = null;
      }
      if (payload?.event !== "COURSE_ATTACHMENT_UPLOADED") return;
      if (!payload?.message) return;
      addNotification({
        type: normalizeNotificationType(payload.type),
        message: payload.message,
        createdAt: payload.createdAt,
      });
    });
  }

  function isImageFile(name: string) {
    const lower = name.toLowerCase();
    return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".webp");
  }

  function resolveAttachmentUrl(url: string | undefined) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${apiBaseUrl}${url}`;
    return `${apiBaseUrl}/${url}`;
  }

  function setPreviewFromFile(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }

  function applySelectedFile(file: File | null) {
    if (!file) return;
    if (file.size > maxFileSizeBytes) {
      setError("Max file size is 10MB.");
      setSelectedFile(null);
      setPreviewFromFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewFromFile(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    applySelectedFile(file);
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    setError(null);
    setPreviewFromFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function refreshMentionState(nextValue: string, cursorIndex: number | null) {
    const mention = getMentionState(nextValue, cursorIndex);
    setMentionState(mention);
    if (!mention) {
      setMentionSelectedIndex(0);
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    setInput(nextValue);
    refreshMentionState(nextValue, event.target.selectionStart);
  }

  function handleInputCursorChange(event: React.SyntheticEvent<HTMLInputElement>) {
    const target = event.currentTarget;
    refreshMentionState(target.value, target.selectionStart);
  }

  function applyMention(username: string) {
    if (!mentionState) return;
    const beforeMention = input.slice(0, mentionState.atIndex + 1);
    const afterMention = input.slice(mentionState.cursorIndex);
    const next = `${beforeMention}${username} ${afterMention}`;
    const nextCursor = (beforeMention + username + " ").length;
    setInput(next);
    setMentionState(null);
    setMentionSelectedIndex(0);
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (mentionState && mentionOptions.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setMentionSelectedIndex((prev) => (prev + 1) % mentionOptions.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setMentionSelectedIndex((prev) =>
          prev <= 0 ? mentionOptions.length - 1 : prev - 1
        );
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const selected = mentionOptions[mentionSelectedIndex] ?? mentionOptions[0];
        if (selected) {
          applyMention(selected);
          return;
        }
      }
      if (event.key === "Escape") {
        setMentionState(null);
        setMentionSelectedIndex(0);
        return;
      }
    }

    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      applySelectedFile(file);
    }
  }

  async function downloadAttachment(message: ChatMessage) {
    if (!message.attachmentUrl) return;
    try {
      const url = resolveAttachmentUrl(message.attachmentUrl);
      const res = await http.get(url, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = message.attachmentName ?? "attachment";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setError("Download failed.");
    }
  }

  async function sendMessage() {
    const content = input.trim();

    if (selectedFile) {
      if (selectedFile.size > maxFileSizeBytes) {
        setError("Max file size is 10MB.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      if (content) formData.append("content", content);
      if (room.kind === "course") {
        formData.append("courseId", String(room.courseId));
      }

      try {
        await http.post("/api/chat/attachments", formData, {
          transformRequest: (data) => data,
          headers: { "Content-Type": undefined as unknown as string },
        });
        setInput("");
        setMentionState(null);
        setMentionSelectedIndex(0);
        clearSelectedFile();
      } catch (err: unknown) {
        const maybeErr = err as {
          response?: { data?: { message?: string } | string };
          message?: string;
        };
        const msg =
          (typeof maybeErr.response?.data === "object"
            ? maybeErr.response?.data?.message
            : maybeErr.response?.data) ??
          maybeErr.message ??
          "Upload failed.";
        setError(msg);
      }
      return;
    }

    if (!content) return;
    const client = clientRef.current;
    if (!client || !client.connected) return;

    const destination =
      room.kind === "global"
        ? "/app/chat/global"
        : `/app/chat/course/${room.courseId}`;

    client.publish({
      destination,
      body: JSON.stringify({ content }),
    });
    setInput("");
    setMentionState(null);
    setMentionSelectedIndex(0);
  }

  function toggleOpen() {
    setOpen((prev) => !prev);
  }

  function formatTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function roomSelectValue() {
    return room.kind === "global" ? "global" : `course:${room.courseId}`;
  }

  function onRoomSelectChange(value: string) {
    if (value === "global") {
      setRoom({ kind: "global" });
      return;
    }
    if (value.startsWith("course:")) {
      const parsed = Number(value.split(":")[1]);
      if (Number.isFinite(parsed)) {
        setRoom({ kind: "course", courseId: parsed });
      }
    }
  }

  return (
    <>
      <button
        onClick={toggleOpen}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          background: "#1f2937",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
        aria-label="Open live chat"
      >
        Chat
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 20,
              height: 20,
              padding: "0 6px",
              borderRadius: 10,
              background: "#e11d48",
              color: "#fff",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            position: "fixed",
            right: 20,
            bottom: 90,
            width: 340,
            maxHeight: 520,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
            outline: isDragging ? "2px dashed #2563eb" : "none",
            outlineOffset: isDragging ? -6 : 0,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              background: "#111827",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                Live Chat
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: connected ? "#22c55e" : "#ef4444",
                    display: "inline-block",
                  }}
                />
              </span>
              {currentCourseId ? (
                <select
                  value={roomSelectValue()}
                  onChange={(e) => onRoomSelectChange(e.target.value)}
                  style={{
                    borderRadius: 6,
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#fff",
                    padding: "4px 6px",
                    fontSize: 12,
                  }}
                >
                  <option value="global">Global</option>
                  <option value={`course:${currentCourseId}`}>Course chat</option>
                </select>
              ) : (
                <span style={{ fontSize: 12, color: "#d1d5db" }}>Room: Global</span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
              }}
              aria-label="Close chat"
            >
              X
            </button>
          </div>

          <div
            ref={messagesRef}
            style={{
              padding: 12,
              overflowY: "auto",
              flex: 1,
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {historyLoading && (
              <div style={{ color: "#64748b", fontSize: 13 }}>
                Loading history...
              </div>
            )}
            {!historyLoading && messages.length === 0 && (
              <div style={{ color: "#64748b", fontSize: 13 }}>
                No messages yet.
              </div>
            )}
            {messages.map((m) => {
              const isOwnMessage = Boolean(
                m.senderEmail && m.senderEmail === currentUserEmail
              );
              const showAdminBadge = (m.senderRole ?? "").toUpperCase() === "ADMIN";

              return (
                <div
                  key={`${m.id}-${m.createdAt}-${m.roomType ?? "GLOBAL"}-${m.courseId ?? "none"}`}
                  style={{
                    alignSelf: isOwnMessage ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  <div
                    style={{
                      background: isOwnMessage ? "#2563eb" : "#e2e8f0",
                      color: isOwnMessage ? "#fff" : "#0f172a",
                      borderRadius: 10,
                      padding: "8px 10px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: isOwnMessage ? "#dbeafe" : "#475569",
                      }}
                    >
                      <strong>
                        {m.username}
                        {showAdminBadge ? " | admin" : ""}
                      </strong>{" "}
                      - {formatTime(m.createdAt)}
                    </div>
                    {m.content && renderMessageContent(m.content, isOwnMessage, currentUsername)}
                  {m.attachmentUrl && m.attachmentName && isImageFile(m.attachmentName) && imagePreviews[m.attachmentUrl] && (
                    <img
                      src={imagePreviews[m.attachmentUrl].url}
                      alt={m.attachmentName}
                      style={{
                        marginTop: 6,
                        width: "100%",
                        maxHeight: 160,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  )}
                  {m.attachmentUrl && (
                    <button
                      onClick={() => downloadAttachment(m)}
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: isOwnMessage ? "#dbeafe" : "#1d4ed8",
                      }}
                    >
                      Attachment: {m.attachmentName ?? "file"}
                    </button>
                  )}
                </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div style={{ padding: "0 12px 6px", color: "crimson", fontSize: 12 }}>
              {error}
            </div>
          )}

          {(selectedFile || previewUrl) && (
            <div
              style={{
                padding: "0 12px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 12,
                color: "#334155",
              }}
            >
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 140,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
              )}
              {selectedFile && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={clearSelectedFile}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {mentionState && mentionOptions.length > 0 && (
            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                background: "#fff",
                padding: "8px 10px",
                display: "grid",
                gap: 6,
                maxHeight: 152,
                overflowY: "auto",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                Mention someone
              </p>
              {mentionOptions.map((name, idx) => {
                const active = idx === mentionSelectedIndex;
                return (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applyMention(name)}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: active ? "#e0f2fe" : "#fff",
                      color: active ? "#075985" : "#0f172a",
                      textAlign: "left",
                      padding: "6px 8px",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    @{name}
                  </button>
                );
              })}
            </div>
          )}

          <div
            style={{
              padding: 10,
              display: "flex",
              gap: 8,
              borderTop: "1px solid #e2e8f0",
              background: "#fff",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onClick={handleInputCursorChange}
              onKeyUp={handleInputCursorChange}
              placeholder={isDragging ? "Drop file to attach" : "Type a message..."}
              onKeyDown={handleInputKeyDown}
              style={{
                flex: 1,
                border: "1px solid #cbd5f5",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 14,
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "1px solid #cbd5f5",
                background: "#fff",
                color: "#1f2937",
                width: 38,
                height: 38,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Attach file"
              title="Attach file"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 13.5L14.5 6a4 4 0 115.66 5.66l-8.49 8.49a6 6 0 11-8.48-8.49l9.9-9.9"
                  stroke="#1f2937"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={sendMessage}
              style={{
                border: "none",
                background: "#2563eb",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function uniqueUsernames(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = (value ?? "").trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result.sort((a, b) => a.localeCompare(b));
}

function getMentionState(value: string, cursorIndex: number | null): MentionState | null {
  const safeCursor = Math.max(0, Math.min(cursorIndex ?? value.length, value.length));
  const beforeCursor = value.slice(0, safeCursor);
  const atIndex = beforeCursor.lastIndexOf("@");
  if (atIndex < 0) return null;
  if (atIndex > 0 && !/\s/.test(beforeCursor[atIndex - 1])) {
    return null;
  }

  const mentionQuery = beforeCursor.slice(atIndex + 1);
  if (mentionQuery.includes(" ")) {
    return null;
  }
  if (!/^[A-Za-z0-9._-]*$/.test(mentionQuery)) {
    return null;
  }

  return {
    atIndex,
    cursorIndex: safeCursor,
    query: mentionQuery,
  };
}

function normalizeNotificationType(type: string | undefined): "success" | "error" | "info" | "warning" {
  const normalized = (type ?? "").toLowerCase();
  if (normalized === "success") return "success";
  if (normalized === "error") return "error";
  if (normalized === "warning") return "warning";
  return "info";
}

function renderMessageContent(content: string, isOwnMessage: boolean, currentUsername: string): ReactNode {
  const mentionRegex = /(^|\s)(@[A-Za-z0-9._-]+)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = mentionRegex.exec(content)) !== null) {
    const prefix = match[1] ?? "";
    const mentionToken = match[2] ?? "";
    const start = match.index;
    const mentionStart = start + prefix.length;

    if (start > lastIndex) {
      nodes.push(content.slice(lastIndex, start));
    }
    if (prefix) {
      nodes.push(prefix);
    }

    const mentionName = mentionToken.slice(1).toLowerCase();
    const isCurrentUserMention =
      mentionName.length > 0 &&
      mentionName === (currentUsername ?? "").trim().toLowerCase();

    nodes.push(
      <span
        key={`mention-${key++}`}
        style={{
          borderRadius: 6,
          padding: "0 4px",
          fontWeight: isCurrentUserMention ? 700 : 600,
          background: isCurrentUserMention
            ? isOwnMessage
              ? "rgba(254,240,138,0.35)"
              : "#fef3c7"
            : isOwnMessage
              ? "rgba(219,234,254,0.28)"
              : "#dbeafe",
          color: isCurrentUserMention
            ? isOwnMessage
              ? "#fef9c3"
              : "#92400e"
            : isOwnMessage
              ? "#dbeafe"
              : "#1d4ed8",
        }}
      >
        {mentionToken}
      </span>
    );

    lastIndex = mentionStart + mentionToken.length;
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }

  return (
    <div style={{ fontSize: 14, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {nodes.length === 0 ? content : nodes}
    </div>
  );
}

