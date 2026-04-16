import type { LeaderboardEntryDto } from "../api/leaderboard";
import type { LessonProgressDto } from "../api/http";

export type LessonExercise = {
  id: number;
  type: "MCQ" | "TRUE_FALSE" | "CODE" | string;
  question: string;
  choices: string[];
  explanation?: string | null;
  orderIndex?: number | null;
};

export type CourseLesson = {
  id: number;
  title: string;
  orderIndex?: number | null;
  content?: string | null;
  starterCode?: string | null;
  editorLanguage?: string | null;
  practiceLanguage?: string | null;
  executionType?: string | null;
  sampleOutput?: string | null;
  exercises?: LessonExercise[];
};

export type LessonState = "COMPLETED" | "IN_PROGRESS" | "LOCKED";

export type CourseUnit = {
  id: string;
  index: number;
  title: string;
  lessons: CourseLesson[];
  completedCount: number;
  totalCount: number;
  percentage: number;
  state: "completed" | "active" | "locked";
};

export function normalizeDateKey(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function computeStreak(progressItems: LessonProgressDto[]) {
  const completedDays = new Set(
    progressItems
      .filter((item) => item.status === "COMPLETED" && item.completedAt)
      .map((item) => normalizeDateKey(item.completedAt as string))
      .filter(Boolean)
  );

  if (completedDays.size === 0) {
    return 0;
  }

  const cursor = new Date();
  let streak = 0;
  const todayKey = normalizeDateKey(cursor.toISOString());

  if (!completedDays.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!completedDays.has(normalizeDateKey(cursor.toISOString()))) {
      return 0;
    }
  }

  while (completedDays.has(normalizeDateKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function countTodayCompleted(progressItems: LessonProgressDto[]) {
  const todayKey = normalizeDateKey(new Date().toISOString());
  return progressItems.filter(
    (item) =>
      item.status === "COMPLETED" &&
      item.completedAt &&
      normalizeDateKey(item.completedAt) === todayKey
  ).length;
}

export function buildLessonStateMap(
  lessons: CourseLesson[],
  progressItems: LessonProgressDto[]
) {
  const sortedLessons = [...lessons].sort(byOrderIndex);
  const stateMap = new Map<number, LessonState>();
  const completedLessonIds = new Set(
    progressItems
      .filter((item) => item.status === "COMPLETED" && typeof item.lessonId === "number")
      .map((item) => item.lessonId as number)
  );

  const explicitInProgress = progressItems.find(
    (item) => item.status === "IN_PROGRESS" && typeof item.lessonId === "number"
  );

  const firstIncomplete =
    explicitInProgress?.lessonId
      ? sortedLessons.find((lesson) => lesson.id === explicitInProgress.lessonId) ?? null
      : sortedLessons.find((lesson) => !completedLessonIds.has(lesson.id)) ?? null;

  let activeAssigned = false;

  sortedLessons.forEach((lesson) => {
    if (completedLessonIds.has(lesson.id)) {
      stateMap.set(lesson.id, "COMPLETED");
      return;
    }

    if (!activeAssigned && firstIncomplete?.id === lesson.id) {
      stateMap.set(lesson.id, "IN_PROGRESS");
      activeAssigned = true;
      return;
    }

    stateMap.set(lesson.id, firstIncomplete ? "LOCKED" : "COMPLETED");
  });

  return stateMap;
}

export function buildUnits(
  lessons: CourseLesson[],
  progressItems: LessonProgressDto[],
  size = 4
) {
  const sortedLessons = [...lessons].sort(byOrderIndex);
  const lessonStateMap = buildLessonStateMap(sortedLessons, progressItems);

  const units = sortedLessons.reduce<CourseUnit[]>((accumulator, lesson, lessonIndex) => {
    const unitIndex = Math.floor(lessonIndex / size);
    const currentUnit = accumulator[unitIndex];

    if (!currentUnit) {
      accumulator.push({
        id: `u-${unitIndex + 1}`,
        index: unitIndex + 1,
        title: deriveUnitTitle(lesson.title),
        lessons: [lesson],
        completedCount: lessonStateMap.get(lesson.id) === "COMPLETED" ? 1 : 0,
        totalCount: 1,
        percentage: 0,
        state: "locked",
      });
      return accumulator;
    }

    currentUnit.lessons.push(lesson);
    currentUnit.totalCount += 1;
    if (lessonStateMap.get(lesson.id) === "COMPLETED") {
      currentUnit.completedCount += 1;
    }
    return accumulator;
  }, []);

  return units.map((unit) => {
    const hasActive = unit.lessons.some(
      (lesson) => lessonStateMap.get(lesson.id) === "IN_PROGRESS"
    );
    const isCompleted = unit.lessons.every(
      (lesson) => lessonStateMap.get(lesson.id) === "COMPLETED"
    );

    return {
      ...unit,
      percentage:
        unit.totalCount > 0
          ? Math.round((unit.completedCount / unit.totalCount) * 100)
          : 0,
      state: (isCompleted ? "completed" : hasActive ? "active" : "locked") as CourseUnit["state"],
    };
  });
}

export function findUnitById(units: CourseUnit[], unitId: string | undefined) {
  return units.find((unit) => unit.id === unitId) ?? null;
}

export function findUnitForLesson(units: CourseUnit[], lessonId: number) {
  return units.find((unit) => unit.lessons.some((lesson) => lesson.id === lessonId)) ?? null;
}

export function buildCoursePath(courseId: number | string) {
  return `/apprendre/${courseId}`;
}

export function buildUnitLessonPath(
  courseId: number | string,
  unitId: string,
  lessonId?: number | null
) {
  return lessonId
    ? `/apprendre/${courseId}/${unitId}/${lessonId}`
    : `/apprendre/${courseId}/${unitId}/lecon`;
}

export function buildUnitExercisesPath(courseId: number | string, unitId: string) {
  return `/apprendre/${courseId}/${unitId}/exercices`;
}

export function buildUnitLessonEntryPath(courseId: number | string, unitId: string) {
  return buildUnitLessonPath(courseId, unitId);
}

export function buildResolvedLessonPath(
  courseId: number | string,
  unit: CourseUnit | null | undefined,
  lessonId?: number | null
) {
  if (!unit) {
    return buildCoursePath(courseId);
  }

  const resolvedLesson =
    typeof lessonId === "number"
      ? unit.lessons.find((lesson) => lesson.id === lessonId) ?? null
      : null;

  return resolvedLesson
    ? buildUnitLessonPath(courseId, unit.id, resolvedLesson.id)
    : buildUnitLessonEntryPath(courseId, unit.id);
}

export function resolveLessonForUnit(
  unit: CourseUnit,
  progressItems: LessonProgressDto[]
) {
  const stateMap = buildLessonStateMap(unit.lessons, progressItems);
  return (
    unit.lessons.find((lesson) => stateMap.get(lesson.id) === "IN_PROGRESS") ??
    unit.lessons.find((lesson) => stateMap.get(lesson.id) !== "COMPLETED") ??
    unit.lessons[0] ??
    null
  );
}

export function getInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

export function getLeaderboardRow(
  leaderboard: LeaderboardEntryDto[],
  username: string
) {
  const normalizedUsername = username.trim().toLowerCase();
  return (
    leaderboard.find(
      (entry) => entry.username.trim().toLowerCase() === normalizedUsername
    ) ?? null
  );
}

function deriveUnitTitle(title: string) {
  const words = title
    .replace(/[^A-Za-z0-9À-ÿ\s]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(" ");

  return words || "Progression";
}

function byOrderIndex(left: CourseLesson, right: CourseLesson) {
  return (left.orderIndex ?? 0) - (right.orderIndex ?? 0);
}
