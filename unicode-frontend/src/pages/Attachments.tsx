import { useEffect, useMemo, useState } from "react";
import { Download, FilePlus2, Trash2 } from "lucide-react";
import { getCourses, type CourseDto } from "../api/courses";
import {
  deleteCourseAttachment,
  downloadCourseAttachment,
  getCourseAttachments,
  uploadCourseAttachment,
  type CourseAttachmentDto,
} from "../api/attachments";
import { getCurrentUser } from "../api/users";
import { getLanguageImage, getLanguageLabel } from "../utils/languageVisuals";
import { getErrorMessage } from "../utils/errorMessage";
import { formatBytes } from "../utils/formatBytes";
import { useToast } from "../components/ToastProvider";

type SelectedCourseFilter = "all" | number;
type AttachmentListItem = CourseAttachmentDto & { courseTitle: string };

export default function Attachments() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<SelectedCourseFilter>("all");
  const [attachments, setAttachments] = useState<AttachmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [deletingAttachmentKey, setDeletingAttachmentKey] = useState<string | null>(null);

  const selectedCourse = useMemo(() => {
    if (typeof selectedCourseFilter !== "number") return null;
    return courses.find((course) => course.id === selectedCourseFilter) ?? null;
  }, [courses, selectedCourseFilter]);

  const selectedCourseImage = getLanguageImage(selectedCourse?.languageCode);
  const selectedCourseLanguageLabel = getLanguageLabel(selectedCourse?.languageCode);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setLoading(true);
      setError(null);

      try {
        const [courseData, me] = await Promise.all([getCourses(), getCurrentUser()]);
        if (cancelled) return;

        setCourses(courseData);
        setIsAdmin((me.role ?? "").toUpperCase() === "ADMIN");
      } catch (err: unknown) {
        const msg = getErrorMessage(err, "Echec du chargement de la page des pieces jointes");
        if (!cancelled) {
          setError(msg);
          setCourses([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAttachments() {
      setLoadingAttachments(true);
      setAttachmentsError(null);

      try {
        if (selectedCourseFilter === "all") {
          if (courses.length === 0) {
            setAttachments([]);
            return;
          }

          const settled = await Promise.allSettled(
            courses.map(async (course) => ({
              course,
              items: await getCourseAttachments(course.id),
            }))
          );

          const merged: AttachmentListItem[] = [];
          for (const result of settled) {
            if (result.status !== "fulfilled") continue;
            const { course, items } = result.value;
            for (const item of items) {
              merged.push({ ...item, courseTitle: course.title });
            }
          }

          merged.sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );

          if (!cancelled) {
            setAttachments(merged);
          }
          return;
        }

        const activeCourse = courses.find((course) => course.id === selectedCourseFilter) ?? null;
        const items = await getCourseAttachments(selectedCourseFilter);
        const withTitle = items.map((item) => ({
          ...item,
          courseTitle: activeCourse?.title ?? `Cours #${item.courseId}`,
        }));

        if (!cancelled) {
          setAttachments(withTitle);
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err, "Echec du chargement des pieces jointes");
        if (!cancelled) {
          setAttachments([]);
          setAttachmentsError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoadingAttachments(false);
        }
      }
    }

    loadAttachments();
    return () => {
      cancelled = true;
    };
  }, [selectedCourseFilter, courses]);

  async function refreshAttachments() {
    setLoadingAttachments(true);
    setAttachmentsError(null);

    try {
      if (selectedCourseFilter === "all") {
        if (courses.length === 0) {
          setAttachments([]);
          return;
        }

        const settled = await Promise.allSettled(
          courses.map(async (course) => ({
            course,
            items: await getCourseAttachments(course.id),
          }))
        );

        const merged: AttachmentListItem[] = [];
        for (const result of settled) {
          if (result.status !== "fulfilled") continue;
          const { course, items } = result.value;
          for (const item of items) {
            merged.push({ ...item, courseTitle: course.title });
          }
        }

        merged.sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

        setAttachments(merged);
        return;
      }

      const activeCourse = courses.find((course) => course.id === selectedCourseFilter) ?? null;
      const items = await getCourseAttachments(selectedCourseFilter);
      setAttachments(
        items.map((item) => ({
          ...item,
          courseTitle: activeCourse?.title ?? `Cours #${item.courseId}`,
        }))
      );
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Echec de l'actualisation des pieces jointes");
      setAttachmentsError(msg);
    } finally {
      setLoadingAttachments(false);
    }
  }

  async function handleDownload(attachment: AttachmentListItem) {
    try {
      await downloadCourseAttachment(
        attachment.courseId,
        attachment.id,
        attachment.originalName
      );
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Echec du telechargement");
      setAttachmentsError(msg);
      showToast({ type: "error", message: msg });
    }
  }

  async function handleUpload() {
    if (typeof selectedCourseFilter !== "number" || !selectedFile) return;
    setUploading(true);
    setAttachmentsError(null);
    setUploadStatus("uploading");
    setUploadStatusMessage(`Envoi de ${selectedFile.name}...`);

    try {
      await uploadCourseAttachment(selectedCourseFilter, selectedFile);
      const successMessage = `${selectedFile.name} envoye avec succes.`;
      setSelectedFile(null);
      setUploadStatus("success");
      setUploadStatusMessage(successMessage);
      showToast({ type: "success", message: successMessage });
      await refreshAttachments();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Echec de l'envoi");
      setAttachmentsError(msg);
      setUploadStatus("error");
      setUploadStatusMessage(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(attachment: AttachmentListItem) {
    const deleteKey = `${attachment.courseId}-${attachment.id}`;
    setDeletingAttachmentKey(deleteKey);
    setAttachmentsError(null);

    try {
      await deleteCourseAttachment(attachment.courseId, attachment.id);
      await refreshAttachments();
      showToast({ type: "success", message: "Piece jointe supprimee." });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Echec de la suppression");
      setAttachmentsError(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setDeletingAttachmentKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Pieces jointes</h2>
            <p className="mt-1 text-sm text-slate-600">Telechargez la serie d&apos;exercices par cours.</p>
          </div>

          <label className="flex min-w-56 flex-col gap-1 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cours
            </span>
              <select
              value={selectedCourseFilter === "all" ? "all" : String(selectedCourseFilter)}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "all") {
                  setSelectedCourseFilter("all");
                  return;
                }

                const numeric = Number(value);
                if (Number.isFinite(numeric) && numeric > 0) {
                  setSelectedCourseFilter(numeric);
                }
              }}
              disabled={loading || courses.length === 0}
              className="field bg-white"
            >
              {courses.length === 0 && <option value="">Aucun cours disponible</option>}
              {courses.length > 0 && <option value="all">Tous les cours</option>}
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading && <p className="text-sm text-slate-600">Chargement des pieces jointes...</p>}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && courses.length === 0 && (
        <section className="panel p-5 text-sm text-slate-600">
          Aucun cours trouve. Ajoutez d'abord un cours, puis envoyez des pieces jointes.
        </section>
      )}

      {!loading && !error && courses.length > 0 && (
        <section className="panel p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-teal-100 bg-white">
              {selectedCourseFilter === "all" ? (
                <span className="text-[11px] font-semibold text-teal-600">TOUS</span>
              ) : selectedCourseImage ? (
                <img
                  src={selectedCourseImage}
                  alt={`${selectedCourseLanguageLabel} logo`}
                  loading="lazy"
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <span className="text-[11px] font-semibold text-teal-600">
                  {selectedCourseLanguageLabel}
                </span>
              )}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Serie d&apos;exercices</h3>
              <p className="text-sm text-slate-600">
                {selectedCourseFilter === "all" ? "Tous les cours" : (selectedCourse?.title ?? "Cours selectionne")}
              </p>
            </div>
          </div>

          {attachmentsError && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {attachmentsError}
            </p>
          )}

          {loadingAttachments ? (
            <p className="mt-4 text-sm text-slate-600">Chargement des fichiers...</p>
          ) : attachments.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] bg-slate-50 px-4 py-6 text-sm text-slate-600">
              {selectedCourseFilter === "all"
                ? "Aucune piece jointe envoyee pour le moment."
                : "Aucune piece jointe envoyee pour ce cours pour le moment."}
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {attachments.map((attachment) => {
                const deleteKey = `${attachment.courseId}-${attachment.id}`;
                return (
                  <li
                    key={deleteKey}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{attachment.originalName}</p>
                      <p className="text-xs text-slate-500">
                        {attachment.courseTitle} - {formatBytes(attachment.sizeBytes)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(attachment)}
                        className="btn-secondary gap-2 px-3 py-1.5 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Telecharger
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(attachment)}
                          disabled={deletingAttachmentKey === deleteKey}
                          className="btn-danger gap-2 px-3 py-1.5 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingAttachmentKey === deleteKey ? "Suppression..." : "Supprimer"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {isAdmin && selectedCourseFilter === "all" && (
            <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              Selectionnez un cours precis dans la liste pour envoyer une nouvelle piece jointe.
            </div>
          )}

          {isAdmin && selectedCourseFilter !== "all" && (
            <div className="mt-5 rounded-lg border border-teal-100 bg-teal-50 p-4">
              <p className="mb-2 text-sm font-semibold text-teal-800">Envoi administrateur</p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,image/*,.zip,.doc,.docx"
                  onChange={(event) => {
                    setSelectedFile(event.target.files?.[0] ?? null);
                    setUploadStatus("idle");
                    setUploadStatusMessage(null);
                  }}
                  className="field max-w-xs bg-white"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="btn-primary gap-2"
                >
                  <FilePlus2 className="h-4 w-4" />
                  {uploading ? "Envoi..." : "Envoyer la piece jointe"}
                </button>
              </div>
              {uploadStatus !== "idle" && uploadStatusMessage && (
                <p
                  className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
                    uploadStatus === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : uploadStatus === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  {uploadStatusMessage}
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}


