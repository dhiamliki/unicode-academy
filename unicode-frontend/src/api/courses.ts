import { http } from "./http";

export type CourseDto = {
  id: number;
  title: string;
  description?: string;
  languageCode?: string;
  languageName?: string;
  language?: {
    id?: number;
    code?: string;
    name?: string;
  } | null;
};

export type LessonSummaryDto = {
  id: number;
  title: string;
  type: "REGULAR" | "FINAL_QUIZ" | string;
  orderIndex?: number | null;
};

export async function getCourses(language?: string): Promise<CourseDto[]> {
  const res = await http.get<CourseDto[]>("/api/courses", {
    params: language ? { language } : undefined,
  });

  return (res.data ?? []).map((course) => ({
    ...course,
    languageCode: course.languageCode ?? course.language?.code ?? undefined,
    languageName: course.languageName ?? course.language?.name ?? undefined,
  }));
}

export async function getLessonSummaries(courseId: number): Promise<LessonSummaryDto[]> {
  const res = await http.get<LessonSummaryDto[]>(`/api/courses/${courseId}/lessons/summary`);
  return res.data ?? [];
}

