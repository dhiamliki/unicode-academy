import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FilePlus2,
  Lock,
  Trash2,
} from "lucide-react";
import { getMyLessonProgress, http } from "../api/http";
import { getProgressSummary } from "../api/progress";
import {
  deleteCourseAttachment,
  downloadCourseAttachment,
  getCourseAttachments,
  uploadCourseAttachment,
  type CourseAttachmentDto,
} from "../api/attachments";
import { getCurrentUser } from "../api/users";

type Course = {
  id: number;
  title: string;
  description?: string;
};

type Lesson = {
  id: number;
  title: string;
};

export default function CourseDetails() {
  const { id } = useParams();
  const courseId = Number(id);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [courseProgressPercentage, setCourseProgressPercentage] = useState(0);

  const [attachments, setAttachments] = useState<CourseAttachmentDto[]>([]);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const regularLessons = useMemo(
    () => lessons.filter((lesson) => !isFinalQuizLesson(lesson)),
    [lessons]
  );

  const finalQuizLessons = useMemo(
    () => lessons.filter((lesson) => isFinalQuizLesson(lesson)),
    [lessons]
  );

  const completedRegularLessonsCount = useMemo(
    () =>
      regularLessons.filter((lesson) => completedLessonIds.includes(lesson.id))
        .length,
    [regularLessons, completedLessonIds]
  );

  const isFinalQuizUnlocked =
    regularLessons.length === 0 ||
    completedRegularLessonsCount >= regularLessons.length;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setAttachmentsError(null);

      try {
        const [courseRes, lessonRes, lessonProgressRes, summary, attachmentList, me] = await Promise.all([
          http.get<Course>(`/api/courses/${courseId}`),
          http.get<Lesson[]>(`/api/courses/${courseId}/lessons`),
          getMyLessonProgress(),
          getProgressSummary(),
          getCourseAttachments(courseId),
          getCurrentUser(),
        ]);

        if (!cancelled) {
          setCourse(courseRes.data);
          setLessons(lessonRes.data);
          setAttachments(attachmentList);
          setIsAdmin((me.role ?? "").toUpperCase() === "ADMIN");

          const completedIds = lessonProgressRes.data
            .filter((progress: any) => progress.status === "COMPLETED")
            .map((progress: any) => progress.lessonId ?? progress.lesson?.id)
            .filter((lessonId: number | undefined) => typeof lessonId === "number");

          setCompletedLessonIds(completedIds);

          const courseSummary = summary.courses.find((item) => item.courseId === courseId);
          setCourseProgressPercentage(courseSummary?.percentage ?? 0);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Failed to load course";
        if (!cancelled) {
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (Number.isFinite(courseId)) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  async function refreshAttachments() {
    try {
      const list = await getCourseAttachments(courseId);
      setAttachments(list);
      setAttachmentsError(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Failed to refresh attachments";
      setAttachmentsError(msg);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setAttachmentsError(null);
    try {
      await uploadCourseAttachment(courseId, selectedFile);
      setSelectedFile(null);
      await refreshAttachments();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Upload failed";
      setAttachmentsError(msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(attachmentId: number) {
    setDeletingAttachmentId(attachmentId);
    setAttachmentsError(null);

    try {
      await deleteCourseAttachment(courseId, attachmentId);
      await refreshAttachments();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
      setAttachmentsError(msg);
    } finally {
      setDeletingAttachmentId(null);
    }
  }

  async function handleDownload(attachment: CourseAttachmentDto) {
    try {
      await downloadCourseAttachment(courseId, attachment.id, attachment.originalName);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Download failed";
      setAttachmentsError(msg);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-800">
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      {loading && <p className="text-sm text-slate-600">Loading course...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && course && (
        <>
          <div className="panel p-6">
            <h2 className="text-2xl font-semibold text-slate-900">{course.title}</h2>
            {course.description && <p className="mt-2 text-sm text-slate-600">{course.description}</p>}

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">
                Course progress: {courseProgressPercentage}%
              </p>
              <div className="progress-track max-w-xl">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.max(0, Math.min(100, courseProgressPercentage))}%` }}
                />
              </div>
            </div>
          </div>

          <section className="panel p-6">
            <h3 className="text-lg font-semibold text-slate-900">Attachments / Serie d'exercices</h3>
            {attachmentsError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {attachmentsError}
              </p>
            )}

            {attachments.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No attachments yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{attachment.originalName}</p>
                      <p className="text-xs text-slate-500">{formatBytes(attachment.sizeBytes)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(attachment)}
                        className="btn-secondary gap-2 px-3 py-1.5 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(attachment.id)}
                          disabled={deletingAttachmentId === attachment.id}
                          className="btn-danger gap-2 px-3 py-1.5 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingAttachmentId === attachment.id ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {isAdmin && (
              <div className="mt-5 rounded-lg border border-teal-100 bg-teal-50 p-4">
                <p className="mb-2 text-sm font-semibold text-teal-800">Admin upload</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                    className="field max-w-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="btn-primary gap-2"
                  >
                    <FilePlus2 className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="panel p-6">
            <h3 className="text-lg font-semibold text-slate-900">Lessons</h3>
            {regularLessons.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No lessons yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {regularLessons.map((lesson) => {
                  const done = completedLessonIds.includes(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <span>{lesson.title}</span>
                        {done && <CheckCircle2 className="h-4 w-4 text-teal-600" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="panel p-6">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-slate-900">Final Quiz</h3>
              <span className="text-xs font-medium text-slate-500">
                {completedRegularLessonsCount}/{regularLessons.length} lessons completed
              </span>
            </div>

            {finalQuizLessons.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No final quiz for this course.</p>
            ) : isFinalQuizUnlocked ? (
              <ul className="mt-4 space-y-2">
                {finalQuizLessons.map((lesson) => {
                  const done = completedLessonIds.includes(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-100"
                      >
                        <span>{lesson.title}</span>
                        {done && <CheckCircle2 className="h-4 w-4 text-teal-600" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-800">
                  <Lock className="h-4 w-4" />
                  Final quiz is locked.
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  Complete all regular lessons first to unlock this section.
                </p>

                <ul className="mt-3 space-y-2">
                  {finalQuizLessons.map((lesson) => (
                    <li key={lesson.id}>
                      <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-sm text-amber-800">
                        <span>{lesson.title}</span>
                        <Lock className="h-4 w-4" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </>
      )}
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

function isFinalQuizLesson(lesson: Lesson) {
  return /quiz\s*final/i.test(lesson.title);
}
