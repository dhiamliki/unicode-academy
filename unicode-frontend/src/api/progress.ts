import { http } from "./http";

export type CourseProgressSummaryDto = {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
};

export type ProgressSummaryTotalsDto = {
  completedCourses: number;
  completedLessons: number;
  attemptedExercises: number;
  correctExercises: number;
};

export type ProgressSummaryDto = {
  courses: CourseProgressSummaryDto[];
  totals: ProgressSummaryTotalsDto;
};

export async function getProgressSummary(): Promise<ProgressSummaryDto> {
  const res = await http.get<ProgressSummaryDto>("/api/progress/summary");
  return res.data;
}

