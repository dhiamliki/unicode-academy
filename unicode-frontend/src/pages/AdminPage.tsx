import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserRole,
  type AdminUserDto,
} from "../api/adminUsers";
import {
  deleteCourseAttachment,
  downloadCourseAttachment,
  getCourseAttachments,
  uploadCourseAttachment,
  type CourseAttachmentDto,
} from "../api/attachments";
import { getCourses } from "../api/courses";
import { getCurrentUser } from "../api/users";
import ConfirmModal from "../components/ConfirmModal";
import { queryKeys } from "../lib/queryKeys";
import { formatBytes } from "../utils/formatBytes";
import { getErrorMessage } from "../utils/errorMessage";

type AdminTab = "users" | "courses" | "attachments";

type AttachmentRow = CourseAttachmentDto & {
  courseTitle: string;
};

type ConfirmState =
  | { type: "delete-user"; user: AdminUserDto }
  | { type: "delete-attachment"; attachment: AttachmentRow }
  | null;

export default function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [selectedAttachmentCourseId, setSelectedAttachmentCourseId] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);

  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses(),
    queryFn: () => getCourses(),
  });

  const adminQuery = useQuery({
    queryKey: queryKeys.adminDashboard,
    enabled: Boolean(coursesQuery.data),
    queryFn: async () => {
      const courses = coursesQuery.data ?? [];
      const [users, attachmentsByCourse] = await Promise.all([
        getAdminUsers(),
        Promise.all(
          courses.map(async (course) => ({
            courseId: course.id,
            courseTitle: course.title,
            items: await getCourseAttachments(course.id),
          }))
        ),
      ]);

      return {
        users,
        courses,
        attachments: attachmentsByCourse.flatMap((group) =>
          group.items.map((attachment) => ({
            ...attachment,
            courseTitle: group.courseTitle,
          }))
        ),
      };
    },
  });

  useEffect(() => {
    const firstError = currentUserQuery.error ?? coursesQuery.error ?? adminQuery.error;

    if (firstError) {
      toast.error(getErrorMessage(firstError, "Impossible de charger l'administration."));
    }
  }, [adminQuery.error, coursesQuery.error, currentUserQuery.error]);

  useEffect(() => {
    if ((currentUserQuery.data?.role ?? "").toUpperCase() !== "ADMIN" && currentUserQuery.data) {
      navigate("/accueil", { replace: true });
    }
  }, [currentUserQuery.data, navigate]);

  useEffect(() => {
    if (selectedAttachmentCourseId || !adminQuery.data?.courses.length) {
      return;
    }

    setSelectedAttachmentCourseId(String(adminQuery.data.courses[0].id));
  }, [adminQuery.data?.courses, selectedAttachmentCourseId]);

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: "ADMIN" | "USER" }) =>
      updateAdminUserRole(userId, role),
    onSuccess: (_, variables) => {
      toast.success(
        variables.role === "ADMIN"
          ? "Utilisateur promu administrateur."
          : "Utilisateur retrograde en membre."
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Impossible de modifier le role."));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => deleteAdminUser(userId),
    onSuccess: () => {
      toast.success("Utilisateur supprime.");
      setConfirmState(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Suppression impossible."));
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachment: AttachmentRow) =>
      deleteCourseAttachment(attachment.courseId, attachment.id),
    onSuccess: () => {
      toast.success("Piece jointe supprimee.");
      setConfirmState(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Suppression de la piece jointe impossible."));
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ courseId, file }: { courseId: number; file: File }) =>
      uploadCourseAttachment(courseId, file),
    onSuccess: (_, variables) => {
      toast.success("Piece jointe ajoutee.");
      setAttachmentFile(null);
      setAttachmentInputKey((current) => current + 1);
      void Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard }),
        queryClient.invalidateQueries({ queryKey: queryKeys.attachments(variables.courseId) }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Ajout de la piece jointe impossible."));
    },
  });

  const filteredUsers = useMemo(() => {
    const users = adminQuery.data?.users ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return users;
    }

    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)
    );
  }, [adminQuery.data?.users, searchTerm]);

  async function handleAttachmentDownload(attachment: AttachmentRow) {
    try {
      await downloadCourseAttachment(
        attachment.courseId,
        attachment.id,
        attachment.originalName
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Telechargement impossible."));
    }
  }

  function handleAttachmentUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const courseId = Number(selectedAttachmentCourseId);
    if (!Number.isFinite(courseId)) {
      toast.error("Choisis d'abord un cours.");
      return;
    }

    if (!attachmentFile) {
      toast.error("Choisis un fichier a envoyer.");
      return;
    }

    uploadAttachmentMutation.mutate({ courseId, file: attachmentFile });
  }

  if (
    currentUserQuery.isLoading ||
    coursesQuery.isLoading ||
    adminQuery.isLoading ||
    !currentUserQuery.data ||
    !adminQuery.data
  ) {
    return (
      <div className="page page-stack">
        <section className="card content-section">
          <div className="page-stack">
            <p className="section-kicker">Administration</p>
            <h1 className="section-title">Chargement de l'espace d'administration</h1>
            <p className="text-muted">
              Comptes, cours et pieces jointes arrivent dans un seul tableau de controle.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const { users, courses, attachments } = adminQuery.data;
  const languageCount = new Set(
    courses.map((course) => (course.languageCode ?? course.title).trim().toLowerCase())
  ).size;

  return (
    <>
      <div className="page page-stack">
        <section className="card content-section fu">
          <div className="section-head" style={{ alignItems: "center" }}>
            <div className="page-stack" style={{ gap: 8 }}>
              <p className="section-kicker">Administration</p>
              <h1 className="section-title">Centre de controle UniCode</h1>
              <p className="text-muted">
                Gere les membres, surveille les parcours et maintiens le catalogue en ordre.
              </p>
            </div>

            <span className="badge badge-teal">// admin</span>
          </div>
        </section>

        <section className="stats-grid fu fu1">
          <AdminStatCard
            icon="UG"
            value={`${users.length}`}
            label="Utilisateurs"
            tone="var(--teal-soft)"
            iconColor="var(--teal)"
          />
          <AdminStatCard
            icon="CR"
            value={`${courses.length}`}
            label="Cours"
            tone="var(--indigo-soft)"
            iconColor="var(--indigo)"
          />
          <AdminStatCard
            icon="PJ"
            value={`${attachments.length}`}
            label="Pieces jointes"
            tone="var(--yellow-soft)"
            iconColor="var(--yellow)"
          />
          <AdminStatCard
            icon="LG"
            value={`${languageCount}`}
            label="Langages"
            tone="var(--green-soft)"
            iconColor="var(--green)"
          />
        </section>

        <section className="admin-wrap fu fu2">
          <div className="admin-tabs">
            {[
              { key: "users", label: "Utilisateurs" },
              { key: "courses", label: "Cours" },
              { key: "attachments", label: "Pieces jointes" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`admin-tab${activeTab === tab.key ? " active" : ""}`}
                onClick={() => setActiveTab(tab.key as AdminTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "users" ? (
            <div className="card admin-panel">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Membres</p>
                  <h2 className="section-title">Gestion des utilisateurs</h2>
                </div>
                <span className="badge badge-ghost">{`${filteredUsers.length} affiches`}</span>
              </div>

              <div>
                <label htmlFor="admin-user-search" className="field-label">
                  Recherche
                </label>
                <input
                  id="admin-user-search"
                  className="field"
                  type="search"
                  placeholder="Chercher un pseudo ou un email"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              {filteredUsers.map((user) => {
                const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
                return (
                  <div key={user.id} className="admin-row">
                    <div className="admin-avatar">{user.username.slice(0, 2).toUpperCase()}</div>
                    <div className="admin-meta">
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <strong>{user.username}</strong>
                        <span className={`badge ${user.role === "ADMIN" ? "badge-teal" : "badge-ghost"}`}>
                          {user.role}
                        </span>
                      </div>
                      <span className="text-muted">{user.email}</span>
                    </div>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={updateRoleMutation.isPending}
                        onClick={() => updateRoleMutation.mutate({ userId: user.id, role: nextRole })}
                      >
                        {user.role === "ADMIN" ? "Retrograder" : "Promouvoir"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => setConfirmState({ type: "delete-user", user })}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 ? (
                <div
                  style={{
                    background: "var(--surface2)",
                    border: "1px dashed var(--border-bright)",
                    borderRadius: "var(--r-md)",
                    color: "var(--text-3)",
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    padding: 18,
                    textAlign: "center",
                  }}
                >
                  Aucun utilisateur ne correspond a cette recherche.
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === "courses" ? (
            <div className="card admin-panel">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Catalogue</p>
                  <h2 className="section-title">Cours publies</h2>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => toast("L'edition de cours arrive bientot.")}
                >
                  Ajouter un cours
                </button>
              </div>

              {courses.map((course) => (
                <div key={course.id} className="admin-row">
                  <div className="admin-avatar">{course.title.slice(0, 2).toUpperCase()}</div>
                  <div className="admin-meta">
                    <strong>{course.title}</strong>
                    <span className="text-muted">{course.description?.trim() || "Parcours publie"}</span>
                  </div>
                  <div className="admin-actions">
                    <span className="badge badge-indigo">
                      {course.languageName ?? course.languageCode ?? "Langage"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "attachments" ? (
            <div className="card admin-panel">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Ressources</p>
                  <h2 className="section-title">Pieces jointes</h2>
                </div>
                <span className="badge badge-ghost">{`${attachments.length} fichiers`}</span>
              </div>

              <form className="page-stack" style={{ gap: 12 }} onSubmit={handleAttachmentUpload}>
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr) auto",
                    alignItems: "end",
                  }}
                >
                  <div>
                    <label htmlFor="admin-attachment-course" className="field-label">
                      Cours
                    </label>
                    <select
                      id="admin-attachment-course"
                      className="field"
                      value={selectedAttachmentCourseId}
                      onChange={(event) => setSelectedAttachmentCourseId(event.target.value)}
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="admin-attachment-file" className="field-label">
                      Fichier PDF ou image
                    </label>
                    <input
                      key={attachmentInputKey}
                      id="admin-attachment-file"
                      className="field"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploadAttachmentMutation.isPending}
                  >
                    {uploadAttachmentMutation.isPending ? "Envoi..." : "Ajouter"}
                  </button>
                </div>

                <p className="text-muted">
                  Les pieces jointes ajoutees ici deviennent telechargeables pour les apprenants dans le parcours.
                </p>
              </form>

              {attachments.map((attachment) => (
                <div key={attachment.id} className="admin-row">
                  <div className="admin-avatar">PJ</div>
                  <div className="admin-meta">
                    <strong>{attachment.originalName}</strong>
                    <span className="text-muted">{attachment.courseTitle}</span>
                    <span className="attachment-meta">
                      {`${formatBytes(attachment.sizeBytes)} · ${formatDate(attachment.uploadedAt)}`}
                    </span>
                  </div>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => void handleAttachmentDownload(attachment)}
                    >
                      Telecharger
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setConfirmState({ type: "delete-attachment", attachment })}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}

              {attachments.length === 0 ? (
                <div
                  style={{
                    background: "var(--surface2)",
                    border: "1px dashed var(--border-bright)",
                    borderRadius: "var(--r-md)",
                    color: "var(--text-3)",
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    padding: 18,
                    textAlign: "center",
                  }}
                >
                  Aucune piece jointe disponible pour le moment.
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      <ConfirmModal
        isOpen={confirmState !== null}
        title={
          confirmState?.type === "delete-user"
            ? "Supprimer cet utilisateur ?"
            : "Supprimer cette piece jointe ?"
        }
        message={
          confirmState?.type === "delete-user"
            ? `Le compte ${confirmState.user.username} sera supprime definitivement.`
            : confirmState?.type === "delete-attachment"
              ? `${confirmState.attachment.originalName} sera retire du parcours ${confirmState.attachment.courseTitle}.`
              : ""
        }
        confirmLabel="Confirmer"
        dangerous
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          if (!confirmState) {
            return;
          }

          if (confirmState.type === "delete-user") {
            deleteUserMutation.mutate(confirmState.user.id);
            return;
          }

          deleteAttachmentMutation.mutate(confirmState.attachment);
        }}
      />
    </>
  );
}

type AdminStatCardProps = {
  icon: string;
  value: string;
  label: string;
  tone: string;
  iconColor: string;
};

function AdminStatCard({ icon, value, label, tone, iconColor }: AdminStatCardProps) {
  return (
    <article className="card content-section">
      <div className="page-stack" style={{ gap: 12 }}>
        <div
          style={{
            alignItems: "center",
            background: tone,
            borderRadius: "12px",
            color: iconColor,
            display: "inline-flex",
            fontSize: 14,
            fontWeight: 700,
            height: 40,
            justifyContent: "center",
            width: 40,
          }}
        >
          {icon}
        </div>
        <div style={{ color: "var(--text-1)", fontSize: 26, fontWeight: 800 }}>{value}</div>
        <div style={{ color: "var(--text-3)", fontSize: 12 }}>{label}</div>
      </div>
    </article>
  );
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
