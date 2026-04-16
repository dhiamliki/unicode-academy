import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Client, type IMessage } from "@stomp/stompjs";
import {
  LoaderCircle,
  MessageSquareText,
  Paperclip,
  SendHorizontal,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import SockJS from "sockjs-client/dist/sockjs";
import {
  getChatMessages,
  getSockJsEndpoint,
  resolveBackendUrl,
  uploadChatAttachment,
  type ChatMessageDto,
} from "../api/chat";
import { getCurrentUser } from "../api/users";
import { getToken } from "../auth/session";
import { queryKeys } from "../lib/queryKeys";
import { getErrorMessage } from "../utils/errorMessage";

type ChatWidgetProps = {
  variant?: "widget" | "page";
  courseId?: number | null;
  roomName?: string;
};

type ChatConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "offline";

type RoomScopedMessages = {
  roomKey: string;
  messages: ChatMessageDto[];
};

type RoomScopedConnection = {
  roomKey: string;
  state: ChatConnectionState;
};

type RoomScopedDraft = {
  roomKey: string;
  value: string;
};

type RoomScopedPendingFile = {
  roomKey: string;
  file: File | null;
};

const WIDGET_MESSAGE_LIMIT = 40;
const PAGE_MESSAGE_LIMIT = 80;

export default function ChatWidget({
  variant = "widget",
  courseId = null,
  roomName,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [liveMessagesState, setLiveMessagesState] = useState<RoomScopedMessages>({
    roomKey: typeof courseId === "number" ? `course-${courseId}` : "global",
    messages: [],
  });
  const [connectionSnapshot, setConnectionSnapshot] = useState<RoomScopedConnection>({
    roomKey: typeof courseId === "number" ? `course-${courseId}` : "global",
    state: "idle",
  });
  const [draftState, setDraftState] = useState<RoomScopedDraft>({
    roomKey: typeof courseId === "number" ? `course-${courseId}` : "global",
    value: "",
  });
  const [pendingFileState, setPendingFileState] = useState<RoomScopedPendingFile>({
    roomKey: typeof courseId === "number" ? `course-${courseId}` : "global",
    file: null,
  });
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const clientRef = useRef<Client | null>(null);
  const connectedOnceRef = useRef(false);

  const active = variant === "page" || isOpen;
  const token = getToken();
  const roomKey = typeof courseId === "number" ? `course-${courseId}` : "global";
  const historyLimit = variant === "page" ? PAGE_MESSAGE_LIMIT : WIDGET_MESSAGE_LIMIT;
  const draft = draftState.roomKey === roomKey ? draftState.value : "";
  const pendingFile = pendingFileState.roomKey === roomKey ? pendingFileState.file : null;

  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  const historyQuery = useQuery({
    queryKey: ["chatMessages", roomKey, historyLimit],
    queryFn: () =>
      getChatMessages({
        limit: historyLimit,
        courseId,
      }),
    enabled: active,
    staleTime: 0,
  });

  const topicDestination = useMemo(
    () => (typeof courseId === "number" ? `/topic/chat/course/${courseId}` : "/topic/chat/global"),
    [courseId]
  );
  const sendDestination = useMemo(
    () => (typeof courseId === "number" ? `/app/chat/course/${courseId}` : "/app/chat/global"),
    [courseId]
  );
  const roomLabel = useMemo(
    () =>
      roomName?.trim() ||
      (typeof courseId === "number" ? `Salon cours ${courseId}` : "Salon global"),
    [courseId, roomName]
  );
  const currentUserEmail = currentUserQuery.data?.email?.trim().toLowerCase() ?? "";
  const messages = useMemo(() => {
    const liveMessages = liveMessagesState.roomKey === roomKey ? liveMessagesState.messages : [];
    return mergeMessages(historyQuery.data ?? [], liveMessages);
  }, [historyQuery.data, liveMessagesState, roomKey]);

  const connectionState: ChatConnectionState = !active
    ? "idle"
    : !token
      ? "offline"
      : connectionSnapshot.roomKey === roomKey && connectionSnapshot.state !== "idle"
        ? connectionSnapshot.state
        : "connecting";
  const canSend =
    !isUploadingAttachment &&
    (pendingFile ? Boolean(token) : draft.trim().length > 0 && connectionState === "connected");

  useEffect(() => {
    if (!active) {
      connectedOnceRef.current = false;
      clientRef.current?.deactivate();
      clientRef.current = null;
      return;
    }

    if (!token) {
      return;
    }

    let closedByCleanup = false;

    const client = new Client({
      webSocketFactory: () => new SockJS(getSockJsEndpoint()),
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => undefined,
      beforeConnect: () => {
        const nextToken = getToken();
        client.connectHeaders = nextToken ? { Authorization: `Bearer ${nextToken}` } : {};
        setConnectionSnapshot({
          roomKey,
          state: connectedOnceRef.current ? "reconnecting" : "connecting",
        });
      },
      onConnect: () => {
        connectedOnceRef.current = true;
        setConnectionSnapshot({ roomKey, state: "connected" });
        client.subscribe(topicDestination, (frame) => {
          handleIncomingMessage(frame, roomKey, setLiveMessagesState);
        });
      },
      onDisconnect: () => {
        if (!closedByCleanup) {
          setConnectionSnapshot({ roomKey, state: "offline" });
        }
      },
      onStompError: () => {
        setConnectionSnapshot({ roomKey, state: "offline" });
      },
      onWebSocketClose: () => {
        if (!closedByCleanup) {
          setConnectionSnapshot({
            roomKey,
            state: connectedOnceRef.current ? "reconnecting" : "offline",
          });
        }
      },
      onWebSocketError: () => {
        setConnectionSnapshot({ roomKey, state: "offline" });
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      closedByCleanup = true;
      clientRef.current = null;
      void client.deactivate();
    };
  }, [active, roomKey, token, topicDestination]);

  useEffect(() => {
    if (!active || messages.length === 0) {
      return;
    }

    const viewport = listRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTop = viewport.scrollHeight;
  }, [active, messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = draft.trim();
    if (!canSend) {
      return;
    }

    if (pendingFile) {
      setIsUploadingAttachment(true);
      try {
        const response = await uploadChatAttachment({
          file: pendingFile,
          content: trimmed,
          courseId,
        });

        setLiveMessagesState((current) => ({
          roomKey,
          messages: mergeMessages(
            current.roomKey === roomKey ? current.messages : [],
            [response]
          ),
        }));
        setDraftState({ roomKey, value: "" });
        setPendingFileState({ roomKey, file: null });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Envoi du fichier impossible."));
      } finally {
        setIsUploadingAttachment(false);
      }
      return;
    }

    if (connectionState !== "connected" || !clientRef.current?.connected || !trimmed) {
      return;
    }

    clientRef.current.publish({
      destination: sendDestination,
      body: JSON.stringify({ content: trimmed }),
    });
    setDraftState({ roomKey, value: "" });
  }

  const body = (
    <section
      className={`chat-shell ${variant === "page" ? "chat-shell-page" : "chat-shell-widget"}`}
      aria-label="Chat live"
    >
      <div className="chat-shell-header">
        <div className="chat-shell-copy">
          <span className="section-kicker">{variant === "page" ? "Discussion" : "Live chat"}</span>
          <h2 className="chat-shell-title">
            {variant === "page"
              ? typeof courseId === "number"
                ? "Salon de parcours"
                : "Chat communautaire"
              : "Salon live"}
          </h2>
          <p className="chat-shell-subtitle">
            {variant === "page"
              ? typeof courseId === "number"
                ? "Historique, messages temps reel et pieces jointes lies au parcours courant."
                : "Canal global relie au backend STOMP existant."
              : typeof courseId === "number"
                ? "Messages temps reel relies au salon de ce cours."
                : "Messages temps reel relies au salon global du backend."}
          </p>
        </div>

        <div className="chat-shell-actions">
          <span className="chat-room-pill">{roomLabel}</span>
          <span className={`chat-status-pill chat-status-${connectionState}`}>
            {connectionState === "connected" ? (
              <Wifi size={14} strokeWidth={2.2} />
            ) : connectionState === "connecting" || connectionState === "reconnecting" ? (
              <LoaderCircle size={14} strokeWidth={2.2} className="chat-spin" />
            ) : (
              <WifiOff size={14} strokeWidth={2.2} />
            )}
            <span>{formatConnectionLabel(connectionState)}</span>
          </span>
          {variant === "widget" ? (
            <button
              type="button"
              className="chat-icon-button"
              aria-label="Fermer le chat"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          ) : null}
        </div>
      </div>

      {historyQuery.isError ? (
        <div className="chat-inline-note">
          L'historique est indisponible pour le moment, mais les nouveaux messages arrivent en direct.
        </div>
      ) : null}

      {connectionState === "offline" ? (
        <div className="chat-inline-note">
          La connexion live est indisponible. Le widget retentera automatiquement.
        </div>
      ) : null}

      {pendingFile ? (
        <div
          className="chat-inline-note"
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span>{`Fichier pret : ${pendingFile.name}`}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setPendingFileState({ roomKey, file: null });
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            Retirer
          </button>
        </div>
      ) : null}

      <div ref={listRef} className="chat-message-list">
        {historyQuery.isPending && messages.length === 0 ? (
          <div className="chat-state-card">
            <LoaderCircle size={18} strokeWidth={2.2} className="chat-spin" />
            <span>Chargement des derniers messages...</span>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => {
            const isOwnMessage =
              currentUserEmail.length > 0 &&
              (message.senderEmail ?? "").trim().toLowerCase() === currentUserEmail;

            return (
              <article
                key={getMessageKey(message)}
                className={`chat-message-row${isOwnMessage ? " is-own" : ""}`}
              >
                <div className={`chat-message-bubble${isOwnMessage ? " is-own" : ""}`}>
                  <div className="chat-message-meta">
                    <span className="chat-message-author">
                      {message.username?.trim() || message.senderEmail?.trim() || "Utilisateur"}
                    </span>
                    {message.senderRole?.toUpperCase() === "ADMIN" ? (
                      <span className="chat-role-pill">Admin</span>
                    ) : null}
                    <time dateTime={message.createdAt ?? undefined}>
                      {formatTimestamp(message.createdAt)}
                    </time>
                  </div>

                  {message.content?.trim() ? (
                    <p className="chat-message-content">{message.content.trim()}</p>
                  ) : null}

                  {message.attachmentUrl ? (
                    <a
                      href={resolveBackendUrl(message.attachmentUrl)}
                      className="chat-attachment-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {message.attachmentName?.trim() || "Piece jointe"}
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <div className="chat-state-card">
            <MessageSquareText size={18} strokeWidth={2.2} />
            <span>Aucun message pour l'instant. Lance la discussion.</span>
          </div>
        )}
      </div>

      <form className="chat-composer" onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={(event) =>
            setPendingFileState({
              roomKey,
              file: event.target.files?.[0] ?? null,
            })
          }
        />
        <button
          type="button"
          className="chat-icon-button"
          aria-label="Joindre un fichier"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={16} strokeWidth={2.2} />
        </button>
        <input
          className="chat-input"
          type="text"
          value={draft}
          onChange={(event) => setDraftState({ roomKey, value: event.target.value })}
          placeholder={pendingFile ? "Ajouter un message avec le fichier..." : "Ecrire un message..."}
          maxLength={2000}
        />
        <button type="submit" className="chat-send-button" disabled={!canSend}>
          {isUploadingAttachment ? (
            <LoaderCircle size={16} strokeWidth={2.2} className="chat-spin" />
          ) : (
            <SendHorizontal size={16} strokeWidth={2.2} />
          )}
          <span>{isUploadingAttachment ? "Envoi..." : "Envoyer"}</span>
        </button>
      </form>
    </section>
  );

  if (variant === "page") {
    return <div className="chat-page-layout">{body}</div>;
  }

  return (
    <>
      {isOpen ? (
        <div className="chat-widget-panel" role="dialog" aria-modal="false">
          {body}
        </div>
      ) : (
        <button
          type="button"
          className="chat-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le chat live"
        >
          <MessageSquareText size={18} strokeWidth={2.2} />
          <span>Chat live</span>
        </button>
      )}
    </>
  );
}

function handleIncomingMessage(
  frame: IMessage,
  roomKey: string,
  setLiveMessagesState: Dispatch<SetStateAction<RoomScopedMessages>>
) {
  try {
    const parsed = JSON.parse(frame.body) as ChatMessageDto;
    if (!parsed || typeof parsed !== "object") {
      return;
    }

    setLiveMessagesState((current) => ({
      roomKey,
      messages: mergeMessages(current.roomKey === roomKey ? current.messages : [], [parsed]),
    }));
  } catch {
    // Ignore malformed frames to keep the UI stable.
  }
}

function mergeMessages(...collections: ChatMessageDto[][]) {
  const map = new Map<string, ChatMessageDto>();

  collections.flat().forEach((message) => {
    map.set(getMessageKey(message), message);
  });

  return Array.from(map.values()).sort(compareMessages);
}

function compareMessages(left: ChatMessageDto, right: ChatMessageDto) {
  const timeDiff = getMessageTimestamp(left) - getMessageTimestamp(right);
  if (timeDiff !== 0) {
    return timeDiff;
  }

  return (left.id ?? 0) - (right.id ?? 0);
}

function getMessageTimestamp(message: ChatMessageDto) {
  if (!message.createdAt) {
    return 0;
  }

  const timestamp = new Date(message.createdAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getMessageKey(message: ChatMessageDto) {
  if (typeof message.id === "number") {
    return `chat-message-${message.id}`;
  }

  return [
    message.senderEmail ?? "unknown",
    message.createdAt ?? "unknown",
    message.content ?? "empty",
    message.attachmentUrl ?? "no-file",
  ].join(":");
}

function formatConnectionLabel(state: ChatConnectionState) {
  switch (state) {
    case "connected":
      return "En ligne";
    case "connecting":
      return "Connexion";
    case "reconnecting":
      return "Reconnexion";
    case "offline":
      return "Hors ligne";
    default:
      return "En attente";
  }
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Maintenant";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Maintenant";
  }

  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
