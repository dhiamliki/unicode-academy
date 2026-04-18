export const queryKeys = {
  currentUser: ["currentUser"] as const,
  courses: (lang?: string) => ["courses", lang ?? "all"] as const,
  courseLessons: (courseId: number) => ["courseLessons", courseId] as const,
  lessonSummaries: (courseId: number) => ["lessonSummaries", courseId] as const,
  lessonFull: (lessonId: number) => ["lesson", lessonId] as const,
  lessonProgress: ["lessonProgress"] as const,
  progress: ["progress"] as const,
  leaderboard: (limit?: number) => ["leaderboard", limit ?? "all"] as const,
  attachments: (courseId: number) => ["attachments", courseId] as const,
  adminUsers: ["adminUsers"] as const,
  adminLanguages: ["adminLanguages"] as const,
  adminCourses: ["adminCourses"] as const,
  adminLessons: (courseId: number) => ["adminLessons", courseId] as const,
  adminExercises: (lessonId: number) => ["adminExercises", lessonId] as const,
  chatMessages: (limit = 200) => ["chatMessages", limit] as const,
  lessonGroup: (courseId: number, unitId: string, lessonIds: string) =>
    ["lessonGroup", courseId, unitId, lessonIds] as const,
  exerciseGroup: (courseId: number, unitId: string, lessonIds: string) =>
    ["exerciseGroup", courseId, unitId, lessonIds] as const,
  adminDashboard: ["adminDashboard"] as const,
} as const;
