import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  downloadCourseAttachment,
  getCourseAttachments,
} from "../api/attachments";
import { getCourses } from "../api/courses";
import { getProgressSummary } from "../api/progress";
import { getMyLessonProgress, type LessonProgressDto } from "../api/http";
import { getCurrentUser } from "../api/users";
import { EmptyState } from "./EmptyState";
import LanguageIcon from "./LanguageIcon";
import {
  buildLessonStateMap,
  buildUnitExercisesPath,
  buildUnitLessonEntryPath,
  buildUnits,
  type CourseLesson,
} from "../lib/academy";
import { queryKeys } from "../lib/queryKeys";
import { formatBytes } from "../utils/formatBytes";
import { getErrorMessage } from "../utils/errorMessage";

type CoursePathViewProps = {
  requestedCourseId?: number;
  loadLessons: (courseId: number) => Promise<CourseLesson[]>;
};

export default function CoursePathView({ requestedCourseId, loadLessons }: CoursePathViewProps) {
  const navigate = useNavigate();

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses(),
    queryFn: () => getCourses(),
  });

  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  const lessonProgressQuery = useQuery({
    queryKey: queryKeys.lessonProgress,
    queryFn: getMyLessonProgress,
  });

  const progressQuery = useQuery({
    queryKey: queryKeys.progress,
    queryFn: getProgressSummary,
  });

  const courses = coursesQuery.data ?? [];
  const selectedCourse = useMemo(() => {
    if (courses.length === 0) {
      return null;
    }

    if (typeof requestedCourseId === "number") {
      return courses.find((course) => course.id === requestedCourseId) ?? null;
    }

    const preferredCode = currentUserQuery.data?.preferredLanguageCode?.toLowerCase();
    if (preferredCode) {
      const preferredCourse =
        courses.find((course) => (course.languageCode ?? "").toLowerCase() === preferredCode) ?? null;

      if (preferredCourse) {
        return preferredCourse;
      }
    }

    return courses[0] ?? null;
  }, [courses, currentUserQuery.data?.preferredLanguageCode, requestedCourseId]);

  const requestedCourseMissing =
    typeof requestedCourseId === "number" &&
    !coursesQuery.isLoading &&
    courses.length > 0 &&
    !selectedCourse;

  const pathQuery = useQuery({
    queryKey: queryKeys.lessonSummaries(selectedCourse?.id ?? -1),
    enabled: Boolean(selectedCourse?.id),
    queryFn: () => loadLessons(selectedCourse?.id as number),
  });

  const attachmentsQuery = useQuery({
    queryKey: queryKeys.attachments(selectedCourse?.id ?? -1),
    enabled: Boolean(selectedCourse?.id),
    queryFn: () => getCourseAttachments(selectedCourse?.id as number),
  });

  useEffect(() => {
    const firstError =
      coursesQuery.error ??
      currentUserQuery.error ??
      lessonProgressQuery.error ??
      progressQuery.error ??
      pathQuery.error ??
      attachmentsQuery.error;

    if (firstError) {
      toast.error(getErrorMessage(firstError, "Impossible de charger les parcours."));
    }
  }, [
    attachmentsQuery.error,
    coursesQuery.error,
    currentUserQuery.error,
    lessonProgressQuery.error,
    pathQuery.error,
    progressQuery.error,
  ]);

  const lessons = pathQuery.data ?? [];
  const progressItems = selectedCourse
    ? ((lessonProgressQuery.data?.data ?? []) as LessonProgressDto[]).filter(
        (item) => item.courseId === selectedCourse.id
      )
    : [];
  const units = useMemo(() => buildUnits(lessons, progressItems), [lessons, progressItems]);
  const lessonStateMap = useMemo(
    () => buildLessonStateMap(lessons, progressItems),
    [lessons, progressItems]
  );
  const summaryByCourse = useMemo(
    () => new Map((progressQuery.data?.courses ?? []).map((summary) => [summary.courseId, summary] as const)),
    [progressQuery.data?.courses]
  );
  const selectedSummary = selectedCourse ? summaryByCourse.get(selectedCourse.id) : null;
  const overallPercentage = selectedSummary?.percentage ?? 0;
  const attachments = attachmentsQuery.data ?? [];

  if (
    coursesQuery.isLoading ||
    currentUserQuery.isLoading ||
    lessonProgressQuery.isLoading ||
    progressQuery.isLoading ||
    (Boolean(selectedCourse) && pathQuery.isLoading)
  ) {
    return (
      <div className="page">
        <section className="card content-section">
          <div className="page-stack">
            <p className="section-kicker">Apprendre</p>
            <h1 className="section-title">Preparation de ta carte de progression</h1>
            <p className="text-muted">
              Nous chargeons tes parcours, tes unites et tes prochains points de passage.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (requestedCourseMissing) {
    return (
      <div className="page">
        <section className="card content-section">
          <EmptyState
            eyebrow="Parcours"
            title="Parcours introuvable"
            subtitle="Le parcours demande n'existe pas ou n'est pas accessible dans cet environnement."
            actionLabel="Revenir aux parcours"
            onAction={() => navigate("/apprendre")}
          />
        </section>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="page">
        <section className="card content-section">
          <EmptyState
            eyebrow="Apprendre"
            title="Aucun parcours disponible"
            subtitle="Aucun parcours exploitable n'est disponible pour le moment dans cette base de donnees."
          />
        </section>
      </div>
    );
  }

  async function handleDownloadAttachment(attachmentId: number, originalName: string) {
    if (!selectedCourse) {
      return;
    }

    try {
      await downloadCourseAttachment(selectedCourse.id, attachmentId, originalName);
    } catch (error) {
      toast.error(getErrorMessage(error, "Impossible de telecharger cette piece jointe."));
    }
  }

  return (
    <div className="learn-layout">
      <aside className="learn-sidebar fu">
        <div className="page-stack" style={{ gap: 6 }}>
          <p className="section-kicker">Navigation</p>
          <h2 className="learn-sidebar-title">Mes langages</h2>
        </div>

        <div className="language-list">
          {courses.map((course) => {
            const courseSummary = summaryByCourse.get(course.id);
            const isActive = course.id === selectedCourse.id;

            return (
              <button
                key={course.id}
                type="button"
                className={`learn-tab${isActive ? " active" : ""}`}
                onClick={() => navigate(`/apprendre/${course.id}`)}
              >
                <div className="learn-tab-main">
                  <LanguageIcon code={course.languageCode} size={20} />
                  <span>{course.languageName ?? course.title}</span>
                </div>
                <div className="learn-tab-meta">
                  <span>{`${courseSummary?.percentage ?? 0}%`}</span>
                  <span>{`${courseSummary?.completedLessons ?? 0} faits`}</span>
                </div>
                <div className="prog-track prog-sm">
                  <div className="prog-fill" style={{ width: `${courseSummary?.percentage ?? 0}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="page-stack">
        <section className="course-overview fu fu1">
          <div className="section-head">
            <div className="page-stack" style={{ gap: 6 }}>
              <p className="section-kicker">Parcours actif</p>
              <h1 className="section-title">{selectedCourse.title}</h1>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span className="badge badge-teal">{`${overallPercentage}% termine`}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/chat?courseId=${selectedCourse.id}`)}
              >
                Ouvrir le salon du cours
              </button>
            </div>
          </div>

          <p className="text-muted">
            {selectedCourse.description ||
              "Chaque unite combine une lecon guidee, une pratique et une serie d'exercices."}
          </p>

          <div className="page-stack" style={{ gap: 8 }}>
            <div className="section-head" style={{ alignItems: "center" }}>
              <span className="section-kicker">Progression globale</span>
              <span className="course-row-right">{`${overallPercentage}%`}</span>
            </div>
            <div className="prog-track prog-md">
              <div className="prog-fill" style={{ width: `${overallPercentage}%` }} />
            </div>
          </div>
        </section>

        <section className="card content-section fu fu2">
          <div className="section-head">
            <div className="page-stack" style={{ gap: 6 }}>
              <p className="section-kicker">Ressources</p>
              <h2 className="section-title">Pieces jointes du parcours</h2>
            </div>
            <span className="badge badge-ghost">{`${attachments.length} fichier${attachments.length > 1 ? "s" : ""}`}</span>
          </div>

          {attachmentsQuery.isLoading ? (
            <p className="text-muted">Nous recuperons les ressources de ce parcours.</p>
          ) : attachments.length > 0 ? (
            <div className="page-stack" style={{ gap: 12 }}>
              {attachments.map((attachment) => (
                <div key={attachment.id} className="course-row">
                  <span className="course-icon" aria-hidden="true">
                    PJ
                  </span>
                  <span className="course-row-main">
                    <span className="course-row-title">{attachment.originalName}</span>
                    <span className="course-row-subtitle">
                      {`${formatBytes(attachment.sizeBytes)} · ${formatAttachmentDate(attachment.uploadedAt)}`}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      void handleDownloadAttachment(attachment.id, attachment.originalName)
                    }
                  >
                    Telecharger
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="Ressources"
              title="Aucune piece jointe pour ce parcours"
              subtitle="Les supports PDF ou images ajoutes par l'administration apparaitront ici."
            />
          )}
        </section>

        <section className="unit-list fu fu3">
          {units.length === 0 ? (
            <div className="card content-section">
              <EmptyState
                eyebrow="Contenu"
                title="Aucun contenu exploitable"
                subtitle="Ce parcours ne contient pas encore assez de lecons pour une demonstration fiable."
              />
            </div>
          ) : (
            units.map((unit, index) => {
              const locked = unit.state === "locked";

              return (
                <article key={unit.id} className={`unit-card fu ${resolveFadeClass(index)}`}>
                  <div className="unit-topline">
                    <div className="unit-badge">
                      <span className="unit-badge-index">{`UNITE ${unit.index}`}</span>
                      <div className="page-stack" style={{ gap: 4 }}>
                        <h2 className="unit-title">{unit.title}</h2>
                        <p className="text-muted" style={{ fontSize: 13 }}>
                          {`Unite ${unit.index}`}
                        </p>
                      </div>
                    </div>

                    <span className="node-fraction">{`${unit.completedCount}/${unit.totalCount} lecons validees`}</span>
                  </div>

                  <div className="prog-track prog-sm">
                    <div className="prog-fill" style={{ width: `${unit.percentage}%` }} />
                  </div>

                  <div className="unit-nodes">
                    {unit.lessons.map((lesson, lessonIndex) => {
                      const state = lessonStateMap.get(lesson.id) ?? "LOCKED";
                      const lessonType = (lesson as { type?: string | null }).type ?? null;
                      const isQuiz = lessonType === "FINAL_QUIZ" || /quiz|test|exercice/i.test(lesson.title);
                      return (
                        <div
                          key={lesson.id}
                          style={{ display: "grid", gap: 8, justifyItems: "center", minWidth: 64 }}
                        >
                          <span
                            className={`lesson-node${state === "COMPLETED" ? " done" : ""}${
                              state === "IN_PROGRESS" ? " active" : ""
                            }${state === "LOCKED" ? " locked" : ""}${isQuiz ? " quiz" : ""}`}
                            title={lesson.title}
                            aria-label={`${lesson.title} - ${mapUnitLessonStateLabel(state)}`}
                          >
                            <span className="lesson-node-label">
                              {state === "COMPLETED" ? "OK" : `${lessonIndex + 1}`}
                            </span>
                          </span>
                          <span
                            style={{
                              color: "var(--text-3)",
                              fontSize: 10,
                              fontWeight: 600,
                              textAlign: "center",
                            }}
                          >
                            {shortLabel(lesson.title)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="unit-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={
                        locked
                          ? undefined
                          : {
                              background: "var(--teal-soft)",
                              borderColor: "var(--teal-ring)",
                              color: "var(--teal)",
                            }
                      }
                      disabled={locked}
                      onClick={() => navigate(buildUnitLessonEntryPath(selectedCourse.id, unit.id))}
                    >
                      {locked ? "Lecon verrouillee" : "Ouvrir la lecon"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={locked}
                      onClick={() => navigate(buildUnitExercisesPath(selectedCourse.id, unit.id))}
                    >
                      {locked ? "Exercices verrouilles" : "Ouvrir les exercices"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

function mapUnitLessonStateLabel(state: "COMPLETED" | "IN_PROGRESS" | "LOCKED") {
  if (state === "COMPLETED") {
    return "terminee";
  }

  if (state === "IN_PROGRESS") {
    return "a faire maintenant";
  }

  return "verrouillee";
}

function resolveFadeClass(index: number) {
  const delay = Math.min(index + 1, 5);
  return `fu${delay}`;
}

function shortLabel(value: string) {
  return (
    value
      .split(/\s+/)
      .slice(0, 2)
      .join(" ")
      .replace(/[^A-Za-z0-9\u00C0-\u00FF]/g, " ")
      .trim() || "Lecon"
  );
}

function formatAttachmentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
