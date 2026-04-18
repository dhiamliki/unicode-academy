import { http } from "./http";

export type AdminLanguageDto = {
  id: number;
  code: string;
  name: string;
  courseCount: number;
};

export type AdminLanguageInput = {
  code: string;
  name: string;
};

export type AdminCourseDto = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  languageId: number;
  languageCode?: string | null;
  languageName?: string | null;
  lessonCount: number;
  attachmentCount: number;
  enrolledUsersCount: number;
  completedUsersCount: number;
};

export type AdminCourseInput = {
  code: string;
  title: string;
  description?: string;
  languageId: number;
};

export type AdminLessonDto = {
  id: number;
  courseId: number;
  courseTitle?: string | null;
  title: string;
  content?: string | null;
  orderIndex: number;
  starterCode?: string | null;
  editorLanguage?: string | null;
  executionType?: string | null;
  sampleOutput?: string | null;
  exerciseCount: number;
};

export type AdminLessonInput = {
  title: string;
  content?: string;
  orderIndex: number;
  starterCode?: string;
  editorLanguage?: string;
  executionType?: string;
  sampleOutput?: string;
};

export type AdminExerciseType = "MCQ" | "CODE" | "TRUE_FALSE";

export type AdminExerciseDto = {
  id: number;
  lessonId: number;
  lessonTitle?: string | null;
  type: AdminExerciseType | string;
  question: string;
  choices: string[];
  answer: string;
  explanation?: string | null;
  orderIndex: number;
};

export type AdminExerciseInput = {
  type: AdminExerciseType | string;
  question: string;
  choices: string[];
  answer: string;
  explanation?: string;
  orderIndex: number;
};

export async function getAdminLanguages(): Promise<AdminLanguageDto[]> {
  const res = await http.get<AdminLanguageDto[]>("/api/admin/languages");
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAdminLanguage(payload: AdminLanguageInput): Promise<AdminLanguageDto> {
  const res = await http.post<AdminLanguageDto>("/api/admin/languages", payload);
  return res.data;
}

export async function updateAdminLanguage(
  id: number,
  payload: AdminLanguageInput
): Promise<AdminLanguageDto> {
  const res = await http.put<AdminLanguageDto>(`/api/admin/languages/${id}`, payload);
  return res.data;
}

export async function deleteAdminLanguage(id: number): Promise<void> {
  await http.delete(`/api/admin/languages/${id}`);
}

export async function getAdminCourses(): Promise<AdminCourseDto[]> {
  const res = await http.get<AdminCourseDto[]>("/api/admin/courses");
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAdminCourse(payload: AdminCourseInput): Promise<AdminCourseDto> {
  const res = await http.post<AdminCourseDto>("/api/admin/courses", payload);
  return res.data;
}

export async function updateAdminCourse(
  id: number,
  payload: AdminCourseInput
): Promise<AdminCourseDto> {
  const res = await http.put<AdminCourseDto>(`/api/admin/courses/${id}`, payload);
  return res.data;
}

export async function deleteAdminCourse(id: number): Promise<void> {
  await http.delete(`/api/admin/courses/${id}`);
}

export async function getAdminLessons(courseId: number): Promise<AdminLessonDto[]> {
  const res = await http.get<AdminLessonDto[]>(`/api/admin/courses/${courseId}/lessons`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAdminLesson(
  courseId: number,
  payload: AdminLessonInput
): Promise<AdminLessonDto> {
  const res = await http.post<AdminLessonDto>(`/api/admin/courses/${courseId}/lessons`, payload);
  return res.data;
}

export async function updateAdminLesson(
  lessonId: number,
  payload: AdminLessonInput
): Promise<AdminLessonDto> {
  const res = await http.put<AdminLessonDto>(`/api/admin/lessons/${lessonId}`, payload);
  return res.data;
}

export async function deleteAdminLesson(lessonId: number): Promise<void> {
  await http.delete(`/api/admin/lessons/${lessonId}`);
}

export async function getAdminExercises(lessonId: number): Promise<AdminExerciseDto[]> {
  const res = await http.get<AdminExerciseDto[]>(`/api/admin/lessons/${lessonId}/exercises`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAdminExercise(
  lessonId: number,
  payload: AdminExerciseInput
): Promise<AdminExerciseDto> {
  const res = await http.post<AdminExerciseDto>(`/api/admin/lessons/${lessonId}/exercises`, payload);
  return res.data;
}

export async function updateAdminExercise(
  exerciseId: number,
  payload: AdminExerciseInput
): Promise<AdminExerciseDto> {
  const res = await http.put<AdminExerciseDto>(`/api/admin/exercises/${exerciseId}`, payload);
  return res.data;
}

export async function deleteAdminExercise(exerciseId: number): Promise<void> {
  await http.delete(`/api/admin/exercises/${exerciseId}`);
}

export async function getNextLessonOrderIndex(courseId: number): Promise<number> {
  const res = await http.get<number>(`/api/admin/courses/${courseId}/lessons/next-order`);
  return res.data ?? 1;
}

export async function getNextExerciseOrderIndex(lessonId: number): Promise<number> {
  const res = await http.get<number>(`/api/admin/lessons/${lessonId}/exercises/next-order`);
  return res.data ?? 1;
}
