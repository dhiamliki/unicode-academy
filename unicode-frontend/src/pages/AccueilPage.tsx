import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getCourses, type CourseDto } from "../api/courses";
import { getMyLessonProgress, type LessonProgressDto } from "../api/http";
import {
  getProgressSummary,
  type CourseProgressSummaryDto,
  type ProgressSummaryDto,
} from "../api/progress";
import { getCurrentUser } from "../api/users";
import { EmptyState } from "../components/EmptyState";
import LanguageIcon from "../components/LanguageIcon";
import {
  buildCoursePath,
  computeStreak,
  countTodayCompleted,
} from "../lib/academy";
import { queryKeys } from "../lib/queryKeys";
import { getErrorMessage } from "../utils/errorMessage";
import { getRecentLessons, type RecentLesson } from "../utils/recentLessons";

type DashboardCourseRow = {
  course: CourseDto;
  summary?: CourseProgressSummaryDto;
};

type ContinueTarget = {
  courseId: number;
  courseTitle: string;
  lessonTitle: string;
  percentage: number;
  to: string;
  actionLabel: string;
  stageLabel: string;
  summaryLabel: string;
  progressLabel: string;
};

type TrackItem = {
  courseId: number;
  title: string;
  subtitle: string;
  percentage: number;
  progressLabel: string;
  languageCode: string;
  status: "current" | "active" | "completed" | "upcoming";
  to: string;
};

type SummaryItem = {
  label: string;
  value: string;
  detail: string;
};

export default function AccueilPage() {
  const navigate = useNavigate();

  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses(),
    queryFn: () => getCourses(),
  });

  const progressQuery = useQuery({
    queryKey: queryKeys.progress,
    queryFn: getProgressSummary,
  });

  const lessonProgressQuery = useQuery({
    queryKey: queryKeys.lessonProgress,
    queryFn: getMyLessonProgress,
  });

  useEffect(() => {
    const firstError =
      currentUserQuery.error ??
      coursesQuery.error ??
      progressQuery.error ??
      lessonProgressQuery.error;

    if (firstError) {
      toast.error(getErrorMessage(firstError, "Impossible de charger l'accueil."));
    }
  }, [
    coursesQuery.error,
    currentUserQuery.error,
    lessonProgressQuery.error,
    progressQuery.error,
  ]);

  const currentUser = currentUserQuery.data;
  const progressSummary = progressQuery.data;
  const lessonProgress = ((lessonProgressQuery.data?.data ?? []) as LessonProgressDto[]).filter(
    (item) => typeof item.courseId === "number"
  );

  const courseRows = useMemo(() => {
    if (!progressSummary) {
      return [] as DashboardCourseRow[];
    }

    const courses = coursesQuery.data ?? [];

    const summaries = new Map(
      progressSummary.courses.map((summary) => [summary.courseId, summary] as const)
    );

    return courses
      .map((course) => ({
        course,
        summary: summaries.get(course.id),
      }))
      .sort((left, right) => compareCourseRows(left, right));
  }, [coursesQuery.data, progressSummary]);

  const recentLessons = getRecentLessons();
  const continueTarget = useMemo(
    () => resolveContinueTarget(courseRows, recentLessons),
    [courseRows, recentLessons]
  );
  const trackItems = useMemo(
    () => buildTrackItems(courseRows, continueTarget?.courseId ?? null),
    [continueTarget?.courseId, courseRows]
  );
  const todayCompletedLessons = useMemo(
    () => countTodayCompleted(lessonProgress),
    [lessonProgress]
  );
  const streak = useMemo(() => computeStreak(lessonProgress), [lessonProgress]);
  const lastActivityLabel = useMemo(() => formatLastActivity(lessonProgress), [lessonProgress]);
  const totalLessonsAvailable = progressSummary?.courses.reduce(
    (total, summary) => total + summary.totalLessons,
    0
  ) ?? 0;
  const activeCourseCount = courseRows.filter(
    (item) => (item.summary?.percentage ?? 0) > 0 && (item.summary?.percentage ?? 0) < 100
  ).length;

  const overviewItems = useMemo(
    () =>
      buildOverviewItems(
        progressSummary,
        continueTarget,
        totalLessonsAvailable,
        activeCourseCount,
        lastActivityLabel
      ),
    [activeCourseCount, continueTarget, lastActivityLabel, progressSummary, totalLessonsAvailable]
  );

  const activityItems = useMemo(
    () => buildActivityItems(todayCompletedLessons, streak, lastActivityLabel),
    [lastActivityLabel, streak, todayCompletedLessons]
  );

  if (
    currentUserQuery.isLoading ||
    coursesQuery.isLoading ||
    progressQuery.isLoading ||
    lessonProgressQuery.isLoading ||
    !currentUser ||
    !progressSummary
  ) {
    return <AccueilFallback />;
  }

  const todayLabel = formatTodayLabel();

  return (
    <div className="page dashboard-page">
      <section className="dashboard-hero fu">
        <div className="dashboard-hero-main">
          <div className="dashboard-hero-copy">
            <p className="section-kicker">Reprendre</p>
            <h1 className="dashboard-hero-title">
              {continueTarget ? continueTarget.lessonTitle : "Choisis ton prochain parcours"}
            </h1>
            <p className="dashboard-hero-text">
              {continueTarget
                ? `${continueTarget.courseTitle}. ${continueTarget.summaryLabel}`
                : "Retrouve ici ton parcours en cours, les lecons deja validees et la prochaine etape utile."}
            </p>
          </div>

          <div className="dashboard-hero-meta">
            <span className="dashboard-hero-chip">{todayLabel}</span>
            <span className="dashboard-hero-chip">
              {continueTarget?.stageLabel ?? "Parcours disponibles"}
            </span>
          </div>

          <div className="dashboard-hero-progress">
            <div className="dashboard-hero-progress-head">
              <span>{continueTarget?.progressLabel ?? "Progression globale"}</span>
              <strong>{`${continueTarget?.percentage ?? 0}%`}</strong>
            </div>
            <div className="prog-track prog-lg">
              <div className="prog-fill" style={{ width: `${continueTarget?.percentage ?? 0}%` }} />
            </div>
          </div>

          <div className="dashboard-hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(continueTarget?.to ?? "/apprendre")}
            >
              {continueTarget?.actionLabel ?? "Ouvrir les parcours"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                navigate(
                  continueTarget ? buildCoursePath(continueTarget.courseId) : "/apprendre"
                )
              }
            >
              Voir le parcours
            </button>
          </div>
        </div>

        <div className="dashboard-hero-side">
          <article className="dashboard-metric-card">
            <span className="dashboard-metric-label">Lecons validees</span>
            <strong className="dashboard-metric-value">
              {formatNumber(progressSummary.totals.completedLessons)}
            </strong>
            <span className="dashboard-metric-copy">
              {totalLessonsAvailable > 0
                ? `sur ${formatNumber(totalLessonsAvailable)} lecons disponibles`
                : "Les lecons valides apparaitront ici"}
            </span>
          </article>
          <article className="dashboard-metric-card">
            <span className="dashboard-metric-label">Exercices valides</span>
            <strong className="dashboard-metric-value">
              {formatNumber(progressSummary.totals.correctExercises)}
            </strong>
            <span className="dashboard-metric-copy">
              {progressSummary.totals.attemptedExercises > 0
                ? `${formatNumber(progressSummary.totals.attemptedExercises)} tentatives enregistrees`
                : "Aucun exercice tente pour le moment"}
            </span>
          </article>
          <article className="dashboard-metric-card">
            <span className="dashboard-metric-label">Rythme actuel</span>
            <strong className="dashboard-metric-value">{streak > 0 ? `${streak} j` : "--"}</strong>
            <span className="dashboard-metric-copy">
              {lastActivityLabel === "Aucune activite"
                ? "Aucune lecon validee pour le moment"
                : `Derniere activite ${lastActivityLabel.toLowerCase()}`}
            </span>
          </article>
        </div>
      </section>

      <div className="dashboard-main-grid">
        <div className="dashboard-main-column">
          <section className="dashboard-section card content-section fu fu1">
            <div className="section-head">
              <div className="page-stack" style={{ gap: 6 }}>
                <p className="section-kicker">Parcours</p>
                <h2 className="section-title">Ou tu en es</h2>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate("/apprendre")}
              >
                Ouvrir la carte
              </button>
            </div>

            <div className="dashboard-track-list">
              {trackItems.length > 0 ? (
                trackItems.map((item) => (
                  <button
                    key={item.courseId}
                    type="button"
                    className={`dashboard-track-card ${item.status}`}
                    onClick={() => navigate(item.to)}
                  >
                    <span className="dashboard-track-icon" aria-hidden="true">
                      <LanguageIcon code={item.languageCode} size={28} />
                    </span>
                    <span className="dashboard-track-main">
                      <span className="dashboard-track-head">
                        <span className="dashboard-track-title">{item.title}</span>
                        <span className={`dashboard-track-status ${item.status}`}>
                          {mapTrackStatusLabel(item.status)}
                        </span>
                      </span>
                      <span className="dashboard-track-subtitle">{item.subtitle}</span>
                      <span className="dashboard-track-progress">
                        <span className="prog-track prog-sm">
                          <span className="prog-fill" style={{ width: `${item.percentage}%` }} />
                        </span>
                        <strong>{item.progressLabel}</strong>
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <EmptyState
                  emoji="→"
                  title="Aucun parcours disponible"
                  subtitle="Les parcours apparaitront ici des qu'un langage sera pret a etre suivi."
                />
              )}
            </div>
          </section>

          <section className="dashboard-section card content-section fu fu2">
            <div className="section-head">
              <div className="page-stack" style={{ gap: 6 }}>
                <p className="section-kicker">Reprise</p>
                <h2 className="section-title">Lecons recentes</h2>
              </div>
            </div>

            {recentLessons.length > 0 ? (
              <div className="dashboard-recent-grid">
                {recentLessons.map((lesson) => (
                  <button
                    key={`${lesson.lessonId}-${lesson.visitedAt}`}
                    type="button"
                    className="dashboard-recent-card"
                    onClick={() =>
                      navigate(`/apprendre/${lesson.courseId}/${lesson.unitId}/${lesson.lessonId}`)
                    }
                  >
                    <span className="dashboard-recent-icon" aria-hidden="true">
                      <LanguageIcon code={lesson.languageCode} size={28} />
                    </span>
                    <span className="dashboard-recent-copy">
                      <span className="dashboard-recent-title">{lesson.lessonTitle}</span>
                      <span className="dashboard-recent-subtitle">
                        {`${lesson.courseTitle} • ouvert ${formatRecentVisit(lesson.visitedAt)}`}
                      </span>
                    </span>
                    <span className="dashboard-recent-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                emoji="•"
                title="Aucune lecon recente"
                subtitle="Ouvre un parcours pour retrouver ici ton dernier point de reprise."
                actionLabel="Explorer les parcours"
                onAction={() => navigate("/apprendre")}
              />
            )}
          </section>
        </div>

        <aside className="dashboard-side-column fu fu3">
          <section className="card content-section dashboard-side-card">
            <div className="section-head">
              <div className="page-stack" style={{ gap: 6 }}>
                <p className="section-kicker">Synthese</p>
                <h2 className="section-title">Progression reelle</h2>
              </div>
            </div>

            <div className="summary-list">
              {overviewItems.map((item) => (
                <article key={item.label} className="summary-item">
                  <span className="summary-label">{item.label}</span>
                  <strong className="summary-value">{item.value}</strong>
                  <span className="summary-detail">{item.detail}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="card content-section dashboard-side-card">
            <div className="section-head">
              <div className="page-stack" style={{ gap: 6 }}>
                <p className="section-kicker">Activite</p>
                <h2 className="section-title">Derniers signaux utiles</h2>
              </div>
            </div>

            <div className="summary-list">
              {activityItems.map((item) => (
                <article key={item.label} className="summary-item">
                  <span className="summary-label">{item.label}</span>
                  <strong className="summary-value">{item.value}</strong>
                  <span className="summary-detail">{item.detail}</span>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function AccueilFallback() {
  return (
    <div className="page dashboard-page">
      <section className="dashboard-hero dashboard-hero-loading">
        <div className="dashboard-hero-main">
          <p className="section-kicker">Chargement</p>
          <h1 className="dashboard-hero-title">Preparation de ton espace d'apprentissage</h1>
          <p className="dashboard-hero-text">
            Nous rassemblons ta progression, tes parcours et ton prochain point de reprise.
          </p>
          <div className="dashboard-hero-progress">
            <div className="dashboard-hero-progress-head">
              <span>Synchronisation</span>
              <strong>20%</strong>
            </div>
            <div className="prog-track prog-lg">
              <div className="prog-fill" style={{ width: "20%" }} />
            </div>
          </div>
        </div>

        <div className="dashboard-hero-side">
          {["Lecons validees", "Exercices valides", "Rythme actuel"].map((label) => (
            <article key={label} className="dashboard-metric-card">
              <span className="dashboard-metric-label">{label}</span>
              <strong className="dashboard-metric-value">--</strong>
              <span className="dashboard-metric-copy">Chargement</span>
            </article>
          ))}
        </div>
      </section>

      <div className="dashboard-main-grid">
        <div className="dashboard-main-column">
          {["Ou tu en es", "Lecons recentes"].map((title) => (
            <section key={title} className="card content-section dashboard-side-card">
              <p className="section-kicker">Accueil</p>
              <h2 className="section-title">{title}</h2>
              <p className="text-muted">Nous preparons cette section.</p>
            </section>
          ))}
        </div>
        <aside className="dashboard-side-column">
          {["Progression reelle", "Derniers signaux utiles"].map((title) => (
            <section key={title} className="card content-section dashboard-side-card">
              <p className="section-kicker">Accueil</p>
              <h2 className="section-title">{title}</h2>
              <p className="text-muted">Nous preparons cette section.</p>
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}

function compareCourseRows(left: DashboardCourseRow, right: DashboardCourseRow) {
  const leftProgress = left.summary?.percentage ?? 0;
  const rightProgress = right.summary?.percentage ?? 0;
  const leftStarted = leftProgress > 0 && leftProgress < 100;
  const rightStarted = rightProgress > 0 && rightProgress < 100;

  if (leftStarted !== rightStarted) {
    return leftStarted ? -1 : 1;
  }

  if (leftProgress !== rightProgress) {
    return rightProgress - leftProgress;
  }

  return left.course.title.localeCompare(right.course.title);
}

function resolveContinueTarget(
  courses: DashboardCourseRow[],
  recentLessons: RecentLesson[]
): ContinueTarget | null {
  const recent = recentLessons.find((lesson) =>
    courses.some((item) => item.course.id === lesson.courseId)
  );

  if (recent) {
    const matchingCourse = courses.find((item) => item.course.id === recent.courseId);
    const completedLessons = matchingCourse?.summary?.completedLessons ?? 0;
    const totalLessons = matchingCourse?.summary?.totalLessons ?? 0;

    return {
      courseId: recent.courseId,
      courseTitle: recent.courseTitle,
      lessonTitle: recent.lessonTitle,
      percentage: matchingCourse?.summary?.percentage ?? 0,
      to: `/apprendre/${recent.courseId}/${recent.unitId}/${recent.lessonId}`,
      actionLabel: "Reprendre la lecon",
      stageLabel: "Derniere lecon ouverte",
      summaryLabel: "Tu peux repartir exactement la ou tu t'es arrete.",
      progressLabel: `${completedLessons}/${totalLessons} lecons terminees`,
    };
  }

  const nextCourse =
    courses.find((item) => (item.summary?.percentage ?? 0) > 0 && (item.summary?.percentage ?? 0) < 100) ??
    courses.find((item) => (item.summary?.percentage ?? 0) === 0) ??
    courses[0] ??
    null;

  if (!nextCourse) {
    return null;
  }

  const summary = nextCourse.summary;
  const hasStarted = (summary?.percentage ?? 0) > 0;
  return {
    courseId: nextCourse.course.id,
    courseTitle: nextCourse.course.title,
    lessonTitle: hasStarted ? `Continuer ${nextCourse.course.title}` : `Commencer ${nextCourse.course.title}`,
    percentage: summary?.percentage ?? 0,
    to: buildCoursePath(nextCourse.course.id),
    actionLabel: hasStarted ? "Continuer le parcours" : "Commencer le parcours",
    stageLabel: hasStarted ? "Parcours en cours" : "Nouveau parcours",
    summaryLabel: hasStarted
      ? "Retrouve ton avancement et poursuis sur le bon parcours."
      : "Ce parcours est pret a etre demarre.",
    progressLabel: `${summary?.completedLessons ?? 0}/${summary?.totalLessons ?? 0} lecons terminees`,
  };
}

function buildTrackItems(
  courses: DashboardCourseRow[],
  currentCourseId: number | null
): TrackItem[] {
  return courses.slice(0, 6).map(({ course, summary }) => {
    const percentage = summary?.percentage ?? 0;
    const completedLessons = summary?.completedLessons ?? 0;
    const totalLessons = summary?.totalLessons ?? 0;
    const status =
      percentage >= 100
        ? "completed"
        : currentCourseId === course.id
          ? "current"
          : percentage > 0
            ? "active"
            : "upcoming";

    return {
      courseId: course.id,
      title: course.title,
      subtitle:
        status === "completed"
          ? "Parcours termine"
          : status === "current"
            ? "Priorite actuelle"
            : status === "active"
              ? "Parcours deja commence"
              : "Pret a etre demarre",
      percentage,
      progressLabel:
        totalLessons > 0 ? `${completedLessons}/${totalLessons} lecons` : `${percentage}%`,
      languageCode: course.languageCode ?? "",
      status,
      to: buildCoursePath(course.id),
    };
  });
}

function buildOverviewItems(
  progressSummary: ProgressSummaryDto | undefined,
  continueTarget: ContinueTarget | null,
  totalLessonsAvailable: number,
  activeCourseCount: number,
  lastActivityLabel: string
): SummaryItem[] {
  if (!progressSummary) {
    return [];
  }

  return [
    {
      label: "Prochaine etape",
      value: continueTarget?.lessonTitle ?? "Choisir un parcours",
      detail: continueTarget?.courseTitle ?? "Ouvre la carte pour commencer un premier parcours.",
    },
    {
      label: "Lecons terminees",
      value: `${formatNumber(progressSummary.totals.completedLessons)}/${formatNumber(totalLessonsAvailable)}`,
      detail: "Lecons validees sur l'ensemble des parcours disponibles.",
    },
    {
      label: "Exercices valides",
      value: formatNumber(progressSummary.totals.correctExercises),
      detail:
        progressSummary.totals.attemptedExercises > 0
          ? `${formatNumber(progressSummary.totals.attemptedExercises)} tentatives enregistrees.`
          : "Les validations d'exercices apparaitront ici.",
    },
    {
      label: "Parcours en cours",
      value: formatNumber(activeCourseCount),
      detail:
        progressSummary.totals.completedCourses > 0
          ? `${formatNumber(progressSummary.totals.completedCourses)} parcours termines.`
          : `Derniere activite ${lastActivityLabel.toLowerCase()}.`,
    },
  ];
}

function buildActivityItems(
  todayCompletedLessons: number,
  streak: number,
  lastActivityLabel: string
): SummaryItem[] {
  return [
    {
      label: "Aujourd'hui",
      value: formatNumber(todayCompletedLessons),
      detail: `${todayCompletedLessons > 1 ? "Lecons validees" : "Lecon validee"} depuis minuit.`,
    },
    {
      label: "Rythme actuel",
      value: streak > 0 ? `${streak} jour${streak > 1 ? "s" : ""}` : "A relancer",
      detail:
        streak > 0
          ? "Serie calculee a partir des validations de lecons."
          : "Une nouvelle validation remettra la cadence en route.",
    },
    {
      label: "Derniere activite",
      value: lastActivityLabel,
      detail: "Basee sur ta derniere lecon marquee comme terminee.",
    },
  ];
}

function mapTrackStatusLabel(status: TrackItem["status"]) {
  switch (status) {
    case "completed":
      return "Termine";
    case "current":
      return "A reprendre";
    case "active":
      return "En cours";
    default:
      return "A commencer";
  }
}

function formatTodayLabel() {
  const label = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
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

function formatRecentVisit(timestamp: number) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "recemment";
  }

  return formatDateDistance(date);
}

function formatDateDistance(date: Date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays <= 0) {
    return "aujourd'hui";
  }

  if (diffDays === 1) {
    return "hier";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}
