import axios from "axios";
import { getToken } from "../auth/session";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8081";

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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



