import axios from "axios";
import { endAuthenticatedSession } from "../auth/authState";
import { getRefreshToken, getToken, setAuthTokens } from "../auth/session";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const http = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const authRefreshClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

type AuthRefreshResponse = {
  token: string;
  refreshToken?: string;
};

let refreshTokenRequest: Promise<string | null> | null = null;

function isAuthEndpoint(url?: string) {
  return typeof url === "string" && url.includes("/api/auth/");
}

async function getFreshAccessToken(): Promise<string | null> {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    return null;
  }

  if (!refreshTokenRequest) {
    refreshTokenRequest = authRefreshClient
      .post<AuthRefreshResponse>("/api/auth/refresh", {
        refreshToken: currentRefreshToken,
      })
      .then((res) => {
        const nextAccessToken = res.data?.token;
        if (!nextAccessToken) {
          endAuthenticatedSession();
          return null;
        }

        const nextRefreshToken = res.data?.refreshToken ?? currentRefreshToken;
        setAuthTokens(nextAccessToken, nextRefreshToken);
        return nextAccessToken;
      })
      .catch(() => {
        endAuthenticatedSession();
        return null;
      })
      .finally(() => {
        refreshTokenRequest = null;
      });
  }

  return refreshTokenRequest;
}

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;

    if (
      error?.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const nextAccessToken = await getFreshAccessToken();
    if (!nextAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    (originalRequest.headers as Record<string, string>).Authorization =
      `Bearer ${nextAccessToken}`;

    return http(originalRequest);
  }
);

export type LessonProgressDto = {
  lessonId: number | null;
  courseId?: number | null;
  lessonTitle?: string | null;
  orderIndex?: number | null;
  status: "LOCKED" | "IN_PROGRESS" | "COMPLETED";
  completed?: boolean;
  completedAt: string | null;
};

export const toggleLessonCompletion = async (lessonId: number) => {
  const res = await http.post<LessonProgressDto>(
    `/api/progress/lessons/${lessonId}/toggle`
  );
  return res.data;
};

export const completeLesson = (lessonId: number) =>
  http.post(`/api/progress/lesson/${lessonId}/complete`);

export const uncompleteLesson = (lessonId: number) =>
  http.delete(`/api/progress/lesson/${lessonId}/complete`);

export const getMyLessonProgress = () => http.get(`/api/progress/lessons/me`);

export type CodeRunRequest = {
  language: string;
  code: string;
  stdin?: string;
};

export type CodeRunResponse = {
  success: boolean;
  language: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  timedOut: boolean;
  exitCode: number | null;
};

export const runCode = async (payload: CodeRunRequest) => {
  const res = await http.post<CodeRunResponse>("/api/code/run", payload);
  return res.data;
};
