import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Download,
  Star,
  Trophy,
} from "lucide-react";
import { getCourses, type CourseDto } from "../api/courses";
import {
  getProgressSummary,
  type CourseProgressSummaryDto,
  type ProgressSummaryDto,
} from "../api/progress";
import { getLeaderboard, type LeaderboardEntryDto } from "../api/leaderboard";
import {
  downloadCourseAttachment,
  getCourseAttachments,
  type CourseAttachmentDto,
} from "../api/attachments";
import { getErrorMessage } from "../utils/errorMessage";
import { getLanguageImage, getLanguageLabel } from "../utils/languageVisuals";

type DashboardAttachment = CourseAttachmentDto & {
  courseTitle: string;
};

export default function Dashboard() {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [summary, setSummary] = useState<ProgressSummaryDto | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryDto[]>([]);
  const [attachments, setAttachments] = useState<DashboardAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [courseData, summaryData, leaderboardData] = await Promise.all([
          getCourses(),
          getProgressSummary(),
          getLeaderboard(6),
        ]);

        const attachmentsSettled = await Promise.allSettled(
          courseData.map(async (course) => ({
            course,
            items: await getCourseAttachments(course.id),
          }))
        );

        const mergedAttachments: DashboardAttachment[] = [];
        for (const result of attachmentsSettled) {
          if (result.status !== "fulfilled") continue;
          const { course, items } = result.value;
          for (const item of items) {
            mergedAttachments.push({
              ...item,
              courseTitle: course.title,
            });
          }
        }

        mergedAttachments.sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

        if (!cancelled) {
          setCourses(courseData);
          setSummary(summaryData);
          setLeaderboard(leaderboardData);
          setAttachments(mergedAttachments);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = getErrorMessage(err, "Failed to load dashboard");
          setError(msg);
          setLeaderboard([]);
          setAttachments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const summaryByCourseId = useMemo(() => {
    const map = new Map<number, CourseProgressSummaryDto>();
    summary?.courses.forEach((item) => map.set(item.courseId, item));
    return map;
  }, [summary]);

  const maxPoints = useMemo(() => {
    const top = leaderboard[0]?.points ?? 0;
    return top > 0 ? top : 1;
  }, [leaderboard]);

  async function handleAttachmentDownload(attachment: DashboardAttachment) {
    try {
      await downloadCourseAttachment(
        attachment.courseId,
        attachment.id,
        attachment.originalName
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Download failed"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="panel panel-hover p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-muted text-xs uppercase tracking-wide">Overview</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Welcome back to UniCode</h2>
            <p className="text-muted mt-2 text-sm">
              Track your progress, keep pace with the leaderboard, and continue your lessons.
            </p>
          </div>
          {summary?.totals && (
            <div className="grid grid-cols-2 gap-3 text-right sm:grid-cols-4">
              <StatBadge label="Courses done" value={summary.totals.completedCourses} />
              <StatBadge label="Lessons done" value={summary.totals.completedLessons} />
              <StatBadge label="Attempts" value={summary.totals.attemptedExercises} />
              <StatBadge label="Correct" value={summary.totals.correctExercises} />
            </div>
          )}
        </div>
      </div>

      {loading && <p className="text-muted text-sm">Loading dashboard...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Your Progress</h3>
            <Link to="/courses" className="text-sm font-medium text-teal-600 hover:text-[#0D9488]">
              Browse all courses
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => {
              const courseSummary = summaryByCourseId.get(course.id);
              const totalLessons = courseSummary?.totalLessons ?? 0;
              const completedLessons = courseSummary?.completedLessons ?? 0;
              const percentage = courseSummary?.percentage ?? 0;
              const courseImage = getLanguageImage(course.languageCode);
              const languageLabel = getLanguageLabel(course.languageCode);
              const fallbackLanguageMark = (course.languageCode ?? languageLabel)
                .replace(/[^a-zA-Z0-9+#]/g, "")
                .slice(0, 3)
                .toUpperCase();

              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="course-card"
                >
                  <div className="course-card-head">
                    <span className="course-language-badge">
                      <span className="course-language-icon">
                        {courseImage ? (
                          <img
                            src={courseImage}
                            alt={`${languageLabel} logo`}
                            loading="lazy"
                            className="h-7 w-7 object-contain"
                          />
                        ) : (
                          <span className="course-language-fallback">{fallbackLanguageMark}</span>
                        )}
                      </span>
                      <span className="course-language-copy">
                        <span className="course-language-kicker">Language</span>
                        <span className="course-language-name">{languageLabel}</span>
                      </span>
                    </span>
                    <span className="course-progress-chip">{percentage}%</span>
                  </div>

                  <h4 className="course-card-title">{course.title}</h4>
                  <p className="course-card-subtitle">
                    {completedLessons}/{totalLessons} lessons completed
                  </p>

                  <div className="course-progress-track">
                    <div
                      className="progress-fill transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                    />
                  </div>

                  <div className="mt-auto flex justify-end pt-5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600">
                      <ArrowRight className="h-3.5 w-3.5" />
                      Continue
                    </span>
                  </div>
                </Link>
              );
            })}

            {!loading && courses.length === 0 && (
              <div className="panel panel-hover p-5 text-muted text-sm">No courses available yet.</div>
            )}
          </div>
        </section>

        <aside className="panel panel-hover p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#FACC15]" />
            <h3 className="text-lg font-semibold text-slate-900">Leaderboard</h3>
          </div>

          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-muted">
                No leaderboard data yet.
              </p>
            ) : (
              leaderboard.slice(0, 6).map((entry) => {
                const ratio = Math.round((entry.points / maxPoints) * 100);
                const isFirst = entry.rank === 1;
                return (
                  <div
                    key={`${entry.rank}-${entry.username}`}
                    className={`rounded-lg border p-3 ${
                      isFirst ? "border-[#FACC15] bg-[#FEFCE8]" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <p className={`font-medium ${isFirst ? "text-slate-900" : "text-slate-800"}`}>
                        #{entry.rank} {entry.username}
                      </p>
                      <p className="font-semibold text-slate-900">{entry.points} pts</p>
                    </div>
                    <div className="progress-track mt-2">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.max(5, ratio)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Link
            to="/leaderboard"
            className="mt-4 inline-flex text-sm font-medium text-teal-600 hover:text-[#0D9488]"
          >
            View full leaderboard
          </Link>
        </aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel panel-hover p-5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-900">Attachments</h3>
            <Link to="/attachments" className="btn-secondary px-3 py-1.5 text-xs">
              Open attachments tab
            </Link>
          </div>
          <p className="text-muted mt-1 text-sm">Série d&apos;exercices</p>

          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="text-muted text-sm">Loading attachments...</p>
            ) : attachments.length === 0 ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-muted">
                No attachments available yet.
              </p>
            ) : (
              attachments.slice(0, 6).map((attachment) => (
                <div
                  key={`${attachment.courseId}-${attachment.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{attachment.originalName}</p>
                    <p className="text-xs text-slate-500">
                      {attachment.courseTitle} • {formatBytes(attachment.sizeBytes)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAttachmentDownload(attachment)}
                    className="btn-secondary gap-2 px-3 py-1.5 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel panel-hover p-5">
          <h3 className="text-lg font-semibold text-slate-900">Learning</h3>
          <p className="text-muted mt-1 text-sm">Your weekly momentum snapshot</p>

          <div className="mt-5 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5">
            <div className="flex items-center gap-2 text-teal-600">
              <Star className="h-4 w-4" />
              <p className="text-sm font-semibold">Keep going</p>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              Complete two more lessons this week to keep your streak active and gain leaderboard points.
            </p>
            <Link to="/courses" className="btn-primary mt-4">
              Continue learning
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

type StatBadgeProps = {
  label: string;
  value: number;
};

function StatBadge({ label, value }: StatBadgeProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-left">
      <p className="text-muted text-[11px] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

