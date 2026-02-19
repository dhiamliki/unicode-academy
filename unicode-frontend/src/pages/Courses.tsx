import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, Play } from "lucide-react";
import { getCourses, type CourseDto } from "../api/courses";
import { getProgressSummary } from "../api/progress";
import { getErrorMessage } from "../utils/errorMessage";
import { getLanguageImage, getLanguageLabel } from "../utils/languageVisuals";

export default function Courses() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [progressByCourseId, setProgressByCourseId] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const languageFilter = useMemo(() => searchParams.get("language") ?? undefined, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [courseData, summary] = await Promise.all([
          getCourses(languageFilter),
          getProgressSummary(),
        ]);

        if (!cancelled) {
          setCourses(courseData);
          const progressMap: Record<number, number> = {};
          summary.courses.forEach((item) => {
            progressMap[item.courseId] = item.percentage;
          });
          setProgressByCourseId(progressMap);
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err, "Failed to load courses");
        if (!cancelled) {
          setError(msg);
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
  }, [languageFilter]);

  return (
    <div className="space-y-6">
      <div className="panel panel-hover p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Courses</h2>
            <p className="text-muted mt-1 text-sm">
              Continue your tracks and monitor completion by course.
            </p>
          </div>
          {languageFilter && (
            <span className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-600">
              <Filter className="h-3.5 w-3.5" />
              Filter: {languageFilter}
            </span>
          )}
        </div>
      </div>

      {loading && <p className="text-muted text-sm">Loading courses...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <div className="panel panel-hover p-5 text-muted text-sm">No courses found for this filter.</div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {courses.map((course) => {
          const progress = progressByCourseId[course.id] ?? 0;
          const courseImage = getLanguageImage(course.languageCode);
          const languageLabel = getLanguageLabel(course.languageCode);
          const fallbackLanguageMark = (course.languageCode ?? languageLabel)
            .replace(/[^a-zA-Z0-9+#]/g, "")
            .slice(0, 3)
            .toUpperCase();
          return (
            <Link key={course.id} to={`/courses/${course.id}`} className="course-card">
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
                <span className="course-progress-chip">{progress}%</span>
              </div>

              <h3 className="course-card-title">{course.title}</h3>
              {course.description && (
                <p className="course-card-subtitle line-clamp-2">{course.description}</p>
              )}

              <div className="course-progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-auto flex justify-end pt-5">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600">
                  <Play className="h-3.5 w-3.5" />
                  Continue
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

