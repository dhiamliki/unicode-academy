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

