import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getCourses, type CourseDto } from "../api/courses";
import { getMyLessonProgress, type LessonProgressDto } from "../api/http";
import { getProgressSummary, type ProgressSummaryDto } from "../api/progress";
import { getCurrentUser, uploadAvatar } from "../api/users";
import { endAuthenticatedSession } from "../auth/authState";
import { EmptyState } from "../components/EmptyState";
import LanguageIcon from "../components/LanguageIcon";
import {
  computeStreak,
  getInitials,
  normalizeDateKey,
} from "../lib/academy";
import { queryKeys } from "../lib/queryKeys";
import { getErrorMessage } from "../utils/errorMessage";
import { getRecentLessons } from "../utils/recentLessons";

type ActivityDay = {
  key: string;
  shortLabel: string;
  tooltipLabel: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type CourseProgressRow = {
  key: string;
  name: string;
  languageCode: string;
  percentage: number;
  completedLessons: number;
  totalLessons: number;
};

type SummaryItem = {
  label: string;
  value: string;
  detail: string;
};

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export default function ProfilPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  const progressQuery = useQuery({
    queryKey: queryKeys.progress,
    queryFn: getProgressSummary,
  });

  const lessonProgressQuery = useQuery({
    queryKey: queryKeys.lessonProgress,
    queryFn: getMyLessonProgress,
  });

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses(),
    queryFn: () => getCourses(),
  });

  useEffect(() => {
    const firstError =
      currentUserQuery.error ??
      progressQuery.error ??
      lessonProgressQuery.error ??
      coursesQuery.error;

    if (firstError) {
      toast.error(getErrorMessage(firstError, "Impossible de charger le profil."));
    }
  }, [
    coursesQuery.error,
    currentUserQuery.error,
    lessonProgressQuery.error,
    progressQuery.error,
  ]);

  if (
    currentUserQuery.isLoading ||
    progressQuery.isLoading ||
    lessonProgressQuery.isLoading ||
    coursesQuery.isLoading ||
    !currentUserQuery.data ||
    !progressQuery.data
  ) {
    return (
      <div className="page page-stack">
        <section className="card content-section">
          <div className="page-stack">
            <p className="section-kicker">Profil</p>
            <h1 className="section-title">Chargement de ton profil</h1>
            <p className="text-muted">
              Nous recuperons ton activite, ta progression et les parcours en cours.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const currentUser = currentUserQuery.data;
  const progressSummary = progressQuery.data;
  const lessonProgress = (lessonProgressQuery.data?.data ?? []) as LessonProgressDto[];
  const courses = coursesQuery.data ?? [];
  const initials = getInitials(currentUser.username);
  const avatarUrl = resolveAvatarUrl(currentUser.avatarUrl);
  const streak = computeStreak(lessonProgress);
  const activityDays = buildRecentActivityDays(lessonProgress);
  const activeDays = activityDays.filter((day) => day.count > 0).length;
  const recentLessonsCompleted = activityDays.reduce((total, day) => total + day.count, 0);
  const recentLessons = getRecentLessons();
  const lastActivityLabel = formatLastActivity(lessonProgress);
  const preferredLanguage = resolvePreferredLanguage(currentUser);

  const courseRows = progressSummary.courses.map((summary) => {
    const course = courses.find((item) => item.id === summary.courseId);
    return {
      key: `${summary.courseId}`,
      name: course?.languageName ?? course?.title ?? "Langage",
      languageCode: course?.languageCode ?? "",
      percentage: summary.percentage,
      completedLessons: summary.completedLessons,
      totalLessons: summary.totalLessons,
    } satisfies CourseProgressRow;
  });

  const nextStep = resolveNextStep(progressSummary, courses, recentLessons);
  const focusItems = buildFocusItems(progressSummary, preferredLanguage, lastActivityLabel, nextStep);
  const completedToday = lessonProgress.filter(
    (item) =>
      item.status === "COMPLETED" &&
      item.completedAt &&
      normalizeDateKey(item.completedAt) === normalizeDateKey(new Date().toISOString())
  ).length;

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || isUploadingAvatar) {
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: queryKeys.currentUser }),
        queryClient.refetchQueries({ queryKey: queryKeys.currentUser, exact: true, type: "active" }),
      ]);
      toast.success("Avatar mis a jour.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Impossible de mettre a jour l'avatar."));
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  return (
    <div className="page page-stack">
      <section className="profile-hero fu">
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            justifyContent: "space-between",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 18 }}>
            <div className="profile-avatar">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={currentUser.username}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>

            <div className="page-stack" style={{ gap: 8 }}>
              <div>
                <p className="section-kicker">Profil</p>
                <h1 className="profile-name">{currentUser.username}</h1>
                <p className="profile-handle">{currentUser.email ?? "Email indisponible"}</p>
              </div>

              <p className="text-muted">
                {preferredLanguage
                  ? `Langage prefere : ${preferredLanguage}`
                  : "Aucun langage prefere defini pour le moment."}
              </p>
            </div>
          </div>

          <button type="button" className="btn btn-ghost" onClick={() => navigate("/parametres")}>
            Parametres
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={isUploadingAvatar}
            onClick={() => avatarInputRef.current?.click()}
          >
            {isUploadingAvatar ? "Envoi de l'avatar..." : "Changer l'avatar"}
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>
      </section>

      <section className="stats-row fu fu1">
        <article className="stat-chip">
          <div className="stat-value">{formatNumber(progressSummary.totals.completedLessons)}</div>
          <div className="stat-label">Lecons validees</div>
        </article>
        <article className="stat-chip">
          <div className="stat-value">{formatNumber(progressSummary.totals.correctExercises)}</div>
          <div className="stat-label">Exercices valides</div>
        </article>
        <article className="stat-chip">
          <div className="stat-value">{formatNumber(progressSummary.totals.completedCourses)}</div>
          <div className="stat-label">Parcours termines</div>
        </article>
        <article className="stat-chip">
          <div className="stat-value">{streak > 0 ? `${streak} j` : "--"}</div>
          <div className="stat-label">Rythme actuel</div>
        </article>
      </section>

      <section className="card content-section fu fu2">
        <div className="section-head">
          <div>
            <p className="section-kicker">Synthese</p>
            <h2 className="section-title">Ou aller ensuite</h2>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate(nextStep?.to ?? "/apprendre")}
          >
            {nextStep ? "Reprendre" : "Ouvrir les parcours"}
          </button>
        </div>

        <div className="summary-list summary-grid" style={{ marginTop: 14 }}>
          {focusItems.map((item) => (
            <article key={item.label} className="summary-item">
              <span className="summary-label">{item.label}</span>
              <strong className="summary-value">{item.value}</strong>
              <span className="summary-detail">{item.detail}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card content-section fu fu3">
        <div className="section-head">
          <div>
            <p className="section-kicker">Activite</p>
            <h2 className="section-title">28 derniers jours</h2>
          </div>
          <p className="text-muted">{`${activeDays}/28 jours actifs`}</p>
        </div>

        <div className="activity-summary">
          <p className="activity-summary-copy">
            <strong>{`${activeDays} jours actifs sur 28`}</strong>
            {` • ${recentLessonsCompleted} lecon${recentLessonsCompleted > 1 ? "s" : ""} validee${recentLessonsCompleted > 1 ? "s" : ""}`}
          </p>

          <div className="activity-legend" aria-label="Echelle d'activite">
            <span className="activity-legend-label">Moins</span>
            <div className="activity-legend-scale">
              {[0, 1, 2, 3, 4].map((levelValue) => (
                <span
                  key={`legend-${levelValue}`}
                  className={`activity-legend-swatch level-${levelValue}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="activity-legend-label">Plus</span>
          </div>
        </div>

        <div className="activity-grid-wrap">
          <div className="activity-grid" aria-label="Activite des 28 derniers jours">
            {activityDays.map((day) => (
              <button
                key={day.key}
                type="button"
                className={`activity-cell level-${day.level}`}
                data-tooltip={`${day.tooltipLabel} · ${day.count} lecon${day.count > 1 ? "s" : ""}`}
                aria-label={`${day.tooltipLabel} : ${day.count} lecon${day.count > 1 ? "s" : ""}`}
              />
            ))}
          </div>

          <div className="activity-range" aria-hidden="true">
            <span>{activityDays[0]?.shortLabel ?? ""}</span>
            <span>{activityDays[activityDays.length - 1]?.shortLabel ?? ""}</span>
          </div>
        </div>
      </section>

      <section className="card content-section fu fu4">
        <div className="section-head">
          <div>
            <p className="section-kicker">Parcours</p>
            <h2 className="section-title">Progression par parcours</h2>
          </div>
          <p className="text-muted">{`${courseRows.length} parcours suivis`}</p>
        </div>

        <div className="language-grid" style={{ marginTop: 14 }}>
          {courseRows.length > 0 ? (
            courseRows.map((course) => (
              <div key={course.key} className="course-row">
                <span className="course-icon" aria-hidden="true">
                  <LanguageIcon code={course.languageCode} size={24} />
                </span>
                <span className="course-row-main">
                  <span className="course-row-title">{course.name}</span>
                  <span className="course-row-subtitle">
                    {`${course.completedLessons}/${course.totalLessons} lecons terminees`}
                  </span>
                  <span className="course-row-prog">
                    <span className="prog-track prog-sm">
                      <span className="prog-fill" style={{ width: `${course.percentage}%` }} />
                    </span>
                  </span>
                </span>
                <span className="course-row-right">{`${course.percentage}%`}</span>
              </div>
            ))
          ) : (
            <EmptyState
              emoji="→"
              title="Aucun parcours suivi"
              subtitle="Commence un parcours pour voir ta progression apparaitre ici."
            />
          )}
        </div>
      </section>

      <section className="card content-section fu fu5">
        <div className="settings-row">
          <div className="page-stack" style={{ gap: 6 }}>
            <p className="section-kicker">Compte</p>
            <h2 className="section-title">Parametres et session</h2>
            <p className="text-muted">
              Accede aux reglages utiles de ton compte ou ferme la session sur cet appareil.
            </p>
          </div>

          <button type="button" className="btn btn-primary" onClick={() => navigate("/parametres")}>
            Ouvrir les parametres
          </button>
        </div>

        <div className="summary-list summary-grid" style={{ marginTop: 16 }}>
          <article className="summary-item">
            <span className="summary-label">Aujourd'hui</span>
            <strong className="summary-value">{formatNumber(completedToday)}</strong>
            <span className="summary-detail">Lecons validees depuis minuit.</span>
          </article>
          <article className="summary-item">
            <span className="summary-label">Derniere activite</span>
            <strong className="summary-value">{lastActivityLabel}</strong>
            <span className="summary-detail">Calculee a partir des validations de lecons.</span>
          </article>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-full"
          style={{ marginTop: 16 }}
          onClick={() => {
            endAuthenticatedSession();
            navigate("/login", { replace: true });
          }}
        >
          Se deconnecter
        </button>
      </section>
    </div>
  );
}

function buildActivityCounts(progressItems: LessonProgressDto[]) {
  const counts = new Map<string, number>();

  progressItems.forEach((item) => {
    if (item.status !== "COMPLETED" || !item.completedAt) {
      return;
    }

    const key = normalizeDateKey(item.completedAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return counts;
}

function buildRecentActivityDays(progressItems: LessonProgressDto[]): ActivityDay[] {
  const counts = buildActivityCounts(progressItems);
  const days = Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));

    const key = normalizeDateKey(date.toISOString());
    const count = counts.get(key) ?? 0;

    return {
      key,
      count,
      shortLabel: formatActivityRangeLabel(date),
      tooltipLabel: formatActivityTooltipLabel(date),
    };
  });

  const peakCount = days.reduce((peak, day) => Math.max(peak, day.count), 0);

  return days.map((day) => ({
    ...day,
    level: resolveActivityLevel(day.count, peakCount),
  }));
}

function buildFocusItems(
  progressSummary: ProgressSummaryDto,
  preferredLanguage: string | null,
  lastActivityLabel: string,
  nextStep: { title: string; detail: string; to: string; actionLabel: string } | null
): SummaryItem[] {
  return [
    {
      label: "Prochaine etape",
      value: nextStep?.title ?? "Choisir un parcours",
      detail: nextStep?.detail ?? "Ouvre la carte des parcours pour demarrer ou reprendre.",
    },
    {
      label: "Langage prefere",
      value: preferredLanguage ?? "Non defini",
      detail: "Utilise pour ouvrir en priorite le bon parcours dans Apprendre.",
    },
    {
      label: "Exercices",
      value: formatNumber(progressSummary.totals.correctExercises),
      detail:
        progressSummary.totals.attemptedExercises > 0
          ? `${formatNumber(progressSummary.totals.attemptedExercises)} tentatives enregistrees.`
          : "Aucune tentative enregistree pour le moment.",
    },
    {
      label: "Derniere activite",
      value: lastActivityLabel,
      detail: "Basee sur ta derniere lecon marquee comme terminee.",
    },
  ];
}

function resolveNextStep(
  progressSummary: ProgressSummaryDto,
  courses: CourseDto[],
  recentLessons: ReturnType<typeof getRecentLessons>
) {
  const recent = recentLessons[0];
  if (recent) {
    return {
      title: recent.lessonTitle,
      detail: recent.courseTitle,
      to: `/apprendre/${recent.courseId}/${recent.unitId}/${recent.lessonId}`,
      actionLabel: "Reprendre",
    };
  }

  const activeSummary =
    progressSummary.courses.find((summary) => summary.percentage > 0 && summary.percentage < 100) ??
    progressSummary.courses.find((summary) => summary.percentage === 0) ??
    null;

  if (!activeSummary) {
    return null;
  }

  const course = courses.find((item) => item.id === activeSummary.courseId);
  return {
    title:
      activeSummary.percentage > 0
        ? `Continuer ${course?.title ?? "le parcours"}`
        : `Commencer ${course?.title ?? "un parcours"}`,
    detail: `${activeSummary.completedLessons}/${activeSummary.totalLessons} lecons terminees`,
    to: `/apprendre/${activeSummary.courseId}`,
    actionLabel: activeSummary.percentage > 0 ? "Continuer" : "Commencer",
  };
}

function resolveActivityLevel(count: number, peakCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) {
    return 0;
  }

  if (peakCount <= 1) {
    return 2;
  }

  const ratio = count / peakCount;

  if (ratio >= 0.85) {
    return 4;
  }

  if (ratio >= 0.6) {
    return 3;
  }

  if (ratio >= 0.3) {
    return 2;
  }

  return 1;
}

function formatActivityTooltipLabel(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatActivityRangeLabel(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function resolvePreferredLanguage(
  currentUser: Awaited<ReturnType<typeof getCurrentUser>> | undefined
) {
  const preferredName = currentUser?.preferredLanguageName?.trim();
  if (preferredName) {
    return preferredName;
  }

  const preferredCode = currentUser?.preferredLanguageCode?.trim();
  return preferredCode ? preferredCode.toUpperCase() : null;
}

function resolveAvatarUrl(avatarUrl: string | null | undefined) {
  if (!avatarUrl) {
    return "";
  }
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  if (avatarUrl.startsWith("/")) {
    return `${apiBaseUrl}${avatarUrl}`;
  }
  return `${apiBaseUrl}/${avatarUrl}`;
}

function formatLastActivity(progressItems: LessonProgressDto[]) {
  const latestTimestamp = progressItems.reduce<number | null>((latest, item) => {
    if (item.status !== "COMPLETED" || !item.completedAt) {
      return latest;
    }

    const timestamp = new Date(item.completedAt).getTime();
    if (Number.isNaN(timestamp)) {
      return latest;
    }

    if (latest === null || timestamp > latest) {
      return timestamp;
    }

    return latest;
  }, null);

  if (latestTimestamp === null) {
    return "Aucune activite";
  }

  return formatDateDistance(new Date(latestTimestamp));
}

function formatDateDistance(date: Date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays <= 0) {
    return "Aujourd'hui";
  }

  if (diffDays === 1) {
    return "Hier";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}
