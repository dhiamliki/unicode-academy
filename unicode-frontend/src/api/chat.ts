import { http } from "./http";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").trim();
const WS_BASE_URL = (import.meta.env.VITE_WS_URL ?? API_BASE_URL).trim();

export type ChatMessageDto = {
  id: number;
  userId: number | null;
  username: string | null;
  senderEmail: string | null;
  senderRole: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  content: string | null;
  roomType: string | null;
  courseId: number | null;
  createdAt: string | null;
};

type ChatMessagesParams = {
  limit?: number;
  courseId?: number | null;
};

export async function getChatMessages({
  limit = 50,
  courseId = null,
}: ChatMessagesParams = {}): Promise<ChatMessageDto[]> {
  const res = await http.get<ChatMessageDto[]>("/api/chat/messages", {
    params: {
      limit,
      ...(typeof courseId === "number" ? { courseId } : {}),
    },
  });

  return Array.isArray(res.data) ? res.data : [];
}

export async function uploadChatAttachment(params: {
  file: File;
  content?: string;
  courseId?: number | null;
}): Promise<ChatMessageDto> {
  const formData = new FormData();
  formData.append("file", params.file);

  if (params.content?.trim()) {
    formData.append("content", params.content.trim());
  }

  if (typeof params.courseId === "number") {
    formData.append("courseId", String(params.courseId));
  }

  const res = await http.post<ChatMessageDto>("/api/chat/attachments", formData, {
    transformRequest: (data) => data,
    headers: { "Content-Type": undefined as unknown as string },
  });

  return res.data;
}

export function resolveBackendUrl(path: string | null | undefined) {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedBase = normalizeBaseUrl(API_BASE_URL);
  return path.startsWith("/") ? `${normalizedBase}${path}` : `${normalizedBase}/${path}`;
}

export function getSockJsEndpoint() {
  const normalizedBase = normalizeBaseUrl(WS_BASE_URL)
    .replace(/^ws:/i, "http:")
    .replace(/^wss:/i, "https:");

  return normalizedBase.endsWith("/ws") ? normalizedBase : `${normalizedBase}/ws`;
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}
