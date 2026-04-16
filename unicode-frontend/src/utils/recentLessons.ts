import {
  resolveLanguageCode,
  resolveLegacyLanguageCode,
} from "./languageVisuals";

const KEY = "unicode_recent_lessons";

export type RecentLesson = {
  lessonId: number;
  courseId: number;
  unitId: string;
  lessonTitle: string;
  courseTitle: string;
  languageCode: string;
  visitedAt: number;
};

type StoredRecentLesson = Partial<RecentLesson> & {
  languageIcon?: string | null;
};

export function saveRecentLesson(lesson: RecentLesson) {
  try {
    const existing = getRecentLessons();
    const filtered = existing.filter((item) => item.lessonId !== lesson.lessonId);
    const updated = [
      {
        ...lesson,
        languageCode: resolveLanguageCode(lesson.languageCode) ?? lesson.languageCode,
      },
      ...filtered,
    ].slice(0, 3);

    window.localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage failures and keep the page interactive.
  }
}

export function getRecentLessons(): RecentLesson[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => coerceRecentLesson(item as StoredRecentLesson))
      .filter((item): item is RecentLesson => item !== null);
  } catch {
    return [];
  }
}

function coerceRecentLesson(item: StoredRecentLesson): RecentLesson | null {
  const lessonId = Number(item.lessonId);
  const courseId = Number(item.courseId);
  const visitedAt = Number(item.visitedAt);
  const unitId = typeof item.unitId === "string" ? item.unitId : "";
  const lessonTitle = typeof item.lessonTitle === "string" ? item.lessonTitle : "";
  const courseTitle = typeof item.courseTitle === "string" ? item.courseTitle : "";

  if (
    !Number.isFinite(lessonId) ||
    !Number.isFinite(courseId) ||
    !Number.isFinite(visitedAt) ||
    !unitId ||
    !lessonTitle ||
    !courseTitle
  ) {
    return null;
  }

  const languageCode =
    resolveLanguageCode(item.languageCode) ??
    resolveLegacyLanguageCode(item.languageIcon) ??
    "";

  return {
    lessonId,
    courseId,
    unitId,
    lessonTitle,
    courseTitle,
    languageCode,
    visitedAt,
  };
}
