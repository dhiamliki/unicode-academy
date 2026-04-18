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
  createAdminCourse,
  createAdminExercise,
  createAdminLanguage,
  createAdminLesson,
  deleteAdminCourse,
  deleteAdminExercise,
  deleteAdminLanguage,
  deleteAdminLesson,
  getAdminCourses,
  getAdminExercises,
  getAdminLanguages,
  getAdminLessons,
  updateAdminCourse,
  updateAdminExercise,
  updateAdminLanguage,
  updateAdminLesson,
  type AdminCourseDto,
  type AdminExerciseDto,
  type AdminExerciseInput,
  type AdminLanguageDto,
  type AdminLessonDto,
  getNextLessonOrderIndex,
  getNextExerciseOrderIndex,
} from "../api/adminContent";
import {
  deleteCourseAttachment,
  downloadCourseAttachment,
  getCourseAttachments,
  uploadCourseAttachment,
  type CourseAttachmentDto,
} from "../api/attachments";
import { getCurrentUser } from "../api/users";
import ConfirmModal from "../components/ConfirmModal";
import { queryKeys } from "../lib/queryKeys";
import { formatBytes } from "../utils/formatBytes";
import { getErrorMessage } from "../utils/errorMessage";

type AdminTab = "users" | "languages" | "catalog" | "resources";

type LanguageFormState = {
  code: string;
  name: string;
};

type CourseFormState = {
  code: string;
  title: string;
  description: string;
  languageId: string;
};

type LessonFormState = {
  title: string;
  content: string;
  orderIndex: string;
  starterCode: string;
  editorLanguage: string;
  executionType: string;
  sampleOutput: string;
};

type ExerciseFormState = {
  type: "MCQ" | "CODE" | "TRUE_FALSE";
  question: string;
  choicesText: string;
  answer: string;
  explanation: string;
  orderIndex: string;
};

type AttachmentRow = CourseAttachmentDto & {
  courseTitle: string;
};

type ConfirmState =
  | { type: "delete-user"; user: AdminUserDto }
  | { type: "delete-language"; language: AdminLanguageDto }
  | { type: "delete-course"; course: AdminCourseDto }
  | { type: "delete-lesson"; lesson: AdminLessonDto }
  | { type: "delete-exercise"; exercise: AdminExerciseDto }
  | { type: "delete-attachment"; attachment: AttachmentRow }
  | null;

const emptyLanguageForm: LanguageFormState = {
  code: "",
  name: "",
};

const emptyCourseForm: CourseFormState = {
  code: "",
  title: "",
  description: "",
  languageId: "",
};

const emptyLessonForm: LessonFormState = {
  title: "",
  content: "",
  orderIndex: "1",
  starterCode: "",
  editorLanguage: "",
  executionType: "",
  sampleOutput: "",
};

const emptyExerciseForm: ExerciseFormState = {
  type: "MCQ",
  question: "",
  choicesText: "",
  answer: "",
  explanation: "",
  orderIndex: "1",
};

export default function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("catalog");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [editingLanguageId, setEditingLanguageId] = useState<number | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<number | null>(null);
  const [languageForm, setLanguageForm] = useState<LanguageFormState>(emptyLanguageForm);
  const [courseForm, setCourseForm] = useState<CourseFormState>(emptyCourseForm);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(emptyLessonForm);
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormState>(emptyExerciseForm);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);

  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: getAdminUsers,
  });

  const languagesQuery = useQuery({
    queryKey: queryKeys.adminLanguages,
    queryFn: getAdminLanguages,
  });

  const coursesQuery = useQuery({
    queryKey: queryKeys.adminCourses,
    queryFn: getAdminCourses,
  });

  const languages = useMemo(() => languagesQuery.data ?? [], [languagesQuery.data]);
  const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const effectiveSelectedCourseId = useMemo(() => {
    if (!courses.length) {
      return null;
    }

    return courses.some((course) => course.id === selectedCourseId)
      ? selectedCourseId
      : courses[0].id;
  }, [courses, selectedCourseId]);

  const lessonsQuery = useQuery({
    queryKey: queryKeys.adminLessons(effectiveSelectedCourseId ?? -1),
    enabled: effectiveSelectedCourseId !== null,
    queryFn: () => getAdminLessons(effectiveSelectedCourseId as number),
  });

  const lessons = useMemo(() => lessonsQuery.data ?? [], [lessonsQuery.data]);
  const effectiveSelectedLessonId = useMemo(() => {
    if (!lessons.length) {
      return null;
    }

    return lessons.some((lesson) => lesson.id === selectedLessonId)
      ? selectedLessonId
      : lessons[0].id;
  }, [lessons, selectedLessonId]);

  const exercisesQuery = useQuery({
    queryKey: queryKeys.adminExercises(effectiveSelectedLessonId ?? -1),
    enabled: effectiveSelectedLessonId !== null,
    queryFn: () => getAdminExercises(effectiveSelectedLessonId as number),
  });

  const attachmentsQuery = useQuery({
    queryKey: queryKeys.attachments(effectiveSelectedCourseId ?? -1),
    enabled: effectiveSelectedCourseId !== null,
    queryFn: () => getCourseAttachments(effectiveSelectedCourseId as number),
  });

  const exercises = useMemo(() => exercisesQuery.data ?? [], [exercisesQuery.data]);
  const attachments = useMemo(() => attachmentsQuery.data ?? [], [attachmentsQuery.data]);
  const selectedCourse =
    courses.find((course) => course.id === effectiveSelectedCourseId) ?? null;
  const selectedLesson =
    lessons.find((lesson) => lesson.id === effectiveSelectedLessonId) ?? null;
  const courseLanguageValue =
    courseForm.languageId || (languages[0] ? String(languages[0].id) : "");

  useEffect(() => {
    const firstError =
      currentUserQuery.error ??
      usersQuery.error ??
      languagesQuery.error ??
      coursesQuery.error ??
      lessonsQuery.error ??
      exercisesQuery.error ??
      attachmentsQuery.error;

    if (firstError) {
      toast.error(getErrorMessage(firstError, "Impossible de charger l'administration."));
    }
  }, [
    attachmentsQuery.error,
    coursesQuery.error,
    currentUserQuery.error,
    exercisesQuery.error,
    languagesQuery.error,
    lessonsQuery.error,
    usersQuery.error,
  ]);

  useEffect(() => {
    if ((currentUserQuery.data?.role ?? "").toUpperCase() !== "ADMIN" && currentUserQuery.data) {
      navigate("/accueil", { replace: true });
    }
  }, [currentUserQuery.data, navigate]);

  const filteredUsers = useMemo(() => {
    const users = usersQuery.data ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return users;
    }

    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)
    );
  }, [searchTerm, usersQuery.data]);

  const totalLessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const totalExercisesForSelectedCourse = lessons.reduce(
    (sum, lesson) => sum + lesson.exerciseCount,
    0
  );

  function makeLessonExcerpt(content?: string | null) {
    if (!content) return "Contenu a completer";
    let text = String(content);
    // remove fenced code blocks ```...```
    text = text.replace(/```[\s\S]*?```/g, "");
    // remove inline code `...`
    text = text.replace(/`[^`]*`/g, "");
    // remove images ![alt](url)
    text = text.replace(/!\[.*?\]\(.*?\)/g, "");
    // replace links [text](url) => text
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
    // remove blockquote markers and headings
    text = text.replace(/^>\s?/gm, "");
    text = text.replace(/^#+\s?/gm, "");
    // remove remaining markdown characters like * _ ~ -
    text = text.replace(/[\*_~]/g, "");
    // collapse whitespace
    text = text.replace(/\s+/g, " ").trim();
    if (text.length <= 160) return text;
    return text.slice(0, 160).trim() + "…";
  }

  function resetLanguageForm() {
    setEditingLanguageId(null);
    setLanguageForm(emptyLanguageForm);
  }

  function resetCourseForm() {
    setEditingCourseId(null);
    setCourseForm({
      ...emptyCourseForm,
      languageId: languages[0] ? String(languages[0].id) : "",
    });
  }

  async function resetLessonFormAsync(nextOrderIndex?: number) {
    setEditingLessonId(null);
    let order = nextOrderIndex;
    if (order == null) {
      if (effectiveSelectedCourseId !== null) {
        try {
          order = await getNextLessonOrderIndex(effectiveSelectedCourseId);
        } catch (_) {
          order = lessons.reduce((max, l) => Math.max(max, l.orderIndex), 0) + 1;
        }
      } else {
        order = 1;
      }
    }
    setLessonForm({ ...emptyLessonForm, orderIndex: String(order) });
  }

  async function resetExerciseFormAsync(nextOrderIndex?: number) {
    setEditingExerciseId(null);
    let order = nextOrderIndex;
    if (order == null) {
      if (effectiveSelectedLessonId !== null) {
        try {
          order = await getNextExerciseOrderIndex(effectiveSelectedLessonId);
        } catch (_) {
          order = exercises.reduce((max, e) => Math.max(max, e.orderIndex), 0) + 1;
        }
      } else {
        order = 1;
      }
    }
    setExerciseForm({ ...emptyExerciseForm, orderIndex: String(order) });
  }

  async function invalidateLearningQueries(courseId?: number | null, lessonId?: number | null) {
    await Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLanguages }),
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCourses }),
      queryClient.invalidateQueries({ queryKey: queryKeys.courses() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.progress }),
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard() }),
      queryClient.invalidateQueries({ queryKey: ["lessonGroup"] }),
      queryClient.invalidateQueries({ queryKey: ["exerciseGroup"] }),
      courseId !== null && courseId !== undefined
        ? queryClient.invalidateQueries({ queryKey: queryKeys.adminLessons(courseId) })
        : Promise.resolve(),
      courseId !== null && courseId !== undefined
        ? queryClient.invalidateQueries({ queryKey: queryKeys.lessonSummaries(courseId) })
        : Promise.resolve(),
      courseId !== null && courseId !== undefined
        ? queryClient.invalidateQueries({ queryKey: queryKeys.courseLessons(courseId) })
        : Promise.resolve(),
      courseId !== null && courseId !== undefined
        ? queryClient.invalidateQueries({ queryKey: queryKeys.attachments(courseId) })
        : Promise.resolve(),
      lessonId !== null && lessonId !== undefined
        ? queryClient.invalidateQueries({ queryKey: queryKeys.adminExercises(lessonId) })
        : Promise.resolve(),
      lessonId !== null && lessonId !== undefined
        ? queryClient.invalidateQueries({ queryKey: queryKeys.lessonFull(lessonId) })
        : Promise.resolve(),
    ]);
  }

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: "ADMIN" | "USER" }) =>
      updateAdminUserRole(userId, role),
    onSuccess: (_, variables) => {
      toast.success(
        variables.role === "ADMIN"
          ? "Utilisateur promu administrateur."
          : "Utilisateur retrograde en membre."
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Suppression impossible."));
    },
  });

  const saveLanguageMutation = useMutation({
    mutationFn: (payload: { id?: number; code: string; name: string }) =>
      payload.id
        ? updateAdminLanguage(payload.id, { code: payload.code, name: payload.name })
        : createAdminLanguage({ code: payload.code, name: payload.name }),
    onSuccess: async () => {
      toast.success(editingLanguageId ? "Langage mis a jour." : "Langage ajoute.");
      resetLanguageForm();
      await invalidateLearningQueries();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Impossible d'enregistrer ce langage."));
    },
  });

  const deleteLanguageMutation = useMutation({
    mutationFn: (languageId: number) => deleteAdminLanguage(languageId),
    onSuccess: async () => {
      toast.success("Langage supprime.");
      setConfirmState(null);
      resetLanguageForm();
      await invalidateLearningQueries();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Suppression du langage impossible."));
    },
  });

  const saveCourseMutation = useMutation({
    mutationFn: (payload: {
      id?: number;
      code: string;
      title: string;
      description: string;
      languageId: number;
    }) =>
      payload.id
        ? updateAdminCourse(payload.id, payload)
        : createAdminCourse(payload),
    onSuccess: async (course) => {
      toast.success(editingCourseId ? "Cours mis a jour." : "Cours ajoute.");
      setSelectedCourseId(course.id);
      resetCourseForm();
      await invalidateLearningQueries(course.id);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Impossible d'enregistrer ce cours."));
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: number) => deleteAdminCourse(courseId),
    onSuccess: async () => {
      toast.success("Cours supprime.");
      setConfirmState(null);
      setSelectedCourseId(null);
      setSelectedLessonId(null);
      resetCourseForm();
      void resetLessonFormAsync();
      void resetExerciseFormAsync();
      await invalidateLearningQueries();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Suppression du cours impossible."));
    },
  });

  const saveLessonMutation = useMutation({
    mutationFn: (payload: {
      id?: number;
      courseId: number;
      title: string;
      content: string;
      orderIndex: number;
      starterCode: string;
      editorLanguage: string;
      executionType: string;
      sampleOutput: string;
    }) =>
      payload.id
        ? updateAdminLesson(payload.id, payload)
        : createAdminLesson(payload.courseId, payload),
    onSuccess: async (lesson) => {
      toast.success(editingLessonId ? "Lecon mise a jour." : "Lecon ajoutee.");
      setSelectedLessonId(lesson.id);
      await resetLessonFormAsync(lessons.length + (editingLessonId ? 0 : 1) + 1);
      await invalidateLearningQueries(lesson.courseId, lesson.id);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Impossible d'enregistrer cette lecon."));
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: number) => deleteAdminLesson(lessonId),
    onSuccess: async () => {
      toast.success("Lecon supprimee.");
      setConfirmState(null);
      setSelectedLessonId(null);
      void resetLessonFormAsync();
      void resetExerciseFormAsync();
      await invalidateLearningQueries(effectiveSelectedCourseId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Suppression de la lecon impossible."));
    },
  });

  const saveExerciseMutation = useMutation({
    mutationFn: (payload: { lessonId: number; id?: number } & AdminExerciseInput) =>
      payload.id
        ? updateAdminExercise(payload.id, payload)
        : createAdminExercise(payload.lessonId, payload),
    onSuccess: async (exercise) => {
      toast.success(editingExerciseId ? "Exercice mis a jour." : "Exercice ajoute.");
      await resetExerciseFormAsync(exercises.length + (editingExerciseId ? 0 : 1) + 1);
      await invalidateLearningQueries(effectiveSelectedCourseId, exercise.lessonId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Impossible d'enregistrer cet exercice."));
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: (exerciseId: number) => deleteAdminExercise(exerciseId),
    onSuccess: async () => {
      toast.success("Exercice supprime.");
      setConfirmState(null);
      void resetExerciseFormAsync();
      await invalidateLearningQueries(effectiveSelectedCourseId, effectiveSelectedLessonId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Suppression de l'exercice impossible."));
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ courseId, file }: { courseId: number; file: File }) =>
      uploadCourseAttachment(courseId, file),
    onSuccess: async (_, variables) => {
      toast.success("Piece jointe ajoutee.");
      setAttachmentFile(null);
      setAttachmentInputKey((current) => current + 1);
      await invalidateLearningQueries(variables.courseId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Ajout de la piece jointe impossible."));
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachment: AttachmentRow) =>
      deleteCourseAttachment(attachment.courseId, attachment.id),
    onSuccess: async (_, attachment) => {
      toast.success("Piece jointe supprimee.");
      setConfirmState(null);
      await invalidateLearningQueries(attachment.courseId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Suppression de la piece jointe impossible."));
    },
  });

  function handleLanguageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = languageForm.code.trim();
    const name = languageForm.name.trim();
    if (!code || !name) {
      toast.error("Le code et le nom du langage sont obligatoires.");
      return;
    }

    saveLanguageMutation.mutate({
      id: editingLanguageId ?? undefined,
      code,
      name,
    });
  }

  function handleCourseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const languageId = Number(courseLanguageValue);
    if (!courseForm.code.trim() || !courseForm.title.trim() || !Number.isFinite(languageId)) {
      toast.error("Le code, le titre et le langage du cours sont obligatoires.");
      return;
    }

    saveCourseMutation.mutate({
      id: editingCourseId ?? undefined,
      code: courseForm.code.trim(),
      title: courseForm.title.trim(),
      description: courseForm.description.trim(),
      languageId,
    });
  }

  function handleLessonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (effectiveSelectedCourseId === null) {
      toast.error("Selectionne d'abord un cours.");
      return;
    }

    const orderIndex = Number(lessonForm.orderIndex);
    if (!lessonForm.title.trim() || !Number.isInteger(orderIndex) || orderIndex < 1) {
      toast.error("Le titre et un ordre de lecon valide sont obligatoires.");
      return;
    }

    saveLessonMutation.mutate({
      id: editingLessonId ?? undefined,
      courseId: effectiveSelectedCourseId,
      title: lessonForm.title.trim(),
      content: lessonForm.content,
      orderIndex,
      starterCode: lessonForm.starterCode,
      editorLanguage: lessonForm.editorLanguage.trim(),
      executionType: lessonForm.executionType.trim(),
      sampleOutput: lessonForm.sampleOutput,
    });
  }

  function handleExerciseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (effectiveSelectedLessonId === null) {
      toast.error("Selectionne d'abord une lecon.");
      return;
    }

    const orderIndex = Number(exerciseForm.orderIndex);
    if (
      !exerciseForm.question.trim() ||
      !exerciseForm.answer.trim() ||
      !Number.isInteger(orderIndex) ||
      orderIndex < 1
    ) {
      toast.error("Le type, la question, la reponse et l'ordre sont obligatoires.");
      return;
    }

    const parsedChoices = splitChoices(exerciseForm.choicesText);
    if (exerciseForm.type === "MCQ") {
      if (parsedChoices.length < 3 || parsedChoices.length > 6) {
        toast.error("Un QCM doit avoir entre 3 et 6 choix (une ligne par choix).");
        return;
      }
    } else if (exerciseForm.type === "TRUE_FALSE" && parsedChoices.length > 0 && parsedChoices.length !== 2) {
      toast.error("Un vrai/faux doit avoir exactement 2 choix (par defaut true et false).");
      return;
    }

    saveExerciseMutation.mutate({
      id: editingExerciseId ?? undefined,
      lessonId: effectiveSelectedLessonId,
      type: exerciseForm.type,
      question: exerciseForm.question.trim(),
      choices: exerciseForm.type === "CODE" ? [] : parsedChoices,
      answer: exerciseForm.answer.trim(),
      explanation: exerciseForm.explanation.trim(),
      orderIndex,
    });
  }

  function handleAttachmentUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (effectiveSelectedCourseId === null) {
      toast.error("Choisis d'abord un cours.");
      return;
    }

    if (!attachmentFile) {
      toast.error("Choisis un fichier a envoyer.");
      return;
    }

    uploadAttachmentMutation.mutate({
      courseId: effectiveSelectedCourseId,
      file: attachmentFile,
    });
  }

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

  function loadLanguageForEdit(language: AdminLanguageDto) {
    setEditingLanguageId(language.id);
    setLanguageForm({
      code: language.code,
      name: language.name,
    });
    setActiveTab("languages");
  }

  function loadCourseForEdit(course: AdminCourseDto) {
    setSelectedCourseId(course.id);
    setEditingCourseId(course.id);
    setCourseForm({
      code: course.code,
      title: course.title,
      description: course.description ?? "",
      languageId: String(course.languageId),
    });
    setActiveTab("catalog");
  }

  function loadLessonForEdit(lesson: AdminLessonDto) {
    setSelectedCourseId(lesson.courseId);
    setSelectedLessonId(lesson.id);
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      content: lesson.content ?? "",
      orderIndex: String(lesson.orderIndex),
      starterCode: lesson.starterCode ?? "",
      editorLanguage: lesson.editorLanguage ?? "",
      executionType: lesson.executionType ?? "",
      sampleOutput: lesson.sampleOutput ?? "",
    });
    setActiveTab("catalog");
  }

  function loadExerciseForEdit(exercise: AdminExerciseDto) {
    setSelectedLessonId(exercise.lessonId);
    setEditingExerciseId(exercise.id);
    setExerciseForm({
      type: normalizeExerciseType(exercise.type),
      question: exercise.question,
      choicesText: (exercise.choices ?? []).join("\n"),
      answer: exercise.answer,
      explanation: exercise.explanation ?? "",
      orderIndex: String(exercise.orderIndex),
    });
    setActiveTab("catalog");
  }

  if (
    currentUserQuery.isLoading ||
    usersQuery.isLoading ||
    languagesQuery.isLoading ||
    coursesQuery.isLoading ||
    !currentUserQuery.data
  ) {
    return (
      <div className="page page-stack">
        <section className="card content-section">
          <div className="page-stack">
            <p className="section-kicker">Administration</p>
            <h1 className="section-title">Chargement du centre de gestion</h1>
            <p className="text-muted">
              Nous recuperons les utilisateurs, le catalogue et les ressources.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="page page-stack screenshot-compact">
        <section className="card content-section fu">
          <div className="section-head" style={{ alignItems: "center" }}>
            <div className="page-stack" style={{ gap: 8 }}>
              <p className="section-kicker">Administration</p>
              <h1 className="section-title">Gestion pedagogique UniCode</h1>
              <p className="text-muted">
                Gere les langages, le catalogue de cours, les lecons, les exercices et les
                ressources telechargeables depuis un seul espace.
              </p>
            </div>
            <span className="badge badge-teal">// admin</span>
          </div>
        </section>

        <section className="stats-grid fu fu1">
          <AdminStatCard
            icon="UG"
            value={`${usersQuery.data?.length ?? 0}`}
            label="Utilisateurs"
            tone="var(--teal-soft)"
            iconColor="var(--teal)"
          />
          <AdminStatCard
            icon="LG"
            value={`${languages.length}`}
            label="Langages"
            tone="var(--green-soft)"
            iconColor="var(--green)"
          />
          <AdminStatCard
            icon="CR"
            value={`${courses.length}`}
            label="Cours"
            tone="var(--indigo-soft)"
            iconColor="var(--indigo)"
          />
          <AdminStatCard
            icon="LC"
            value={`${totalLessons}`}
            label="Lecons"
            tone="var(--yellow-soft)"
            iconColor="var(--yellow)"
          />
        </section>

        <section className="admin-wrap fu fu2">
          <div className="admin-tabs">
            {[
              { key: "catalog", label: "Catalogue" },
              { key: "languages", label: "Langages" },
              { key: "resources", label: "Ressources" },
              { key: "users", label: "Utilisateurs" },
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
                      <span className="attachment-meta">
                        {`${user.completedCoursesCount} cours · ${user.completedLessonsCount} leçons · ${user.totalPoints} XP`}
                      </span>
                    </div>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={updateRoleMutation.isPending}
                        onClick={() =>
                          updateRoleMutation.mutate({ userId: user.id, role: nextRole })
                        }
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
                <InlineEmpty message="Aucun utilisateur ne correspond a cette recherche." />
              ) : null}
            </div>
          ) : null}

          {activeTab === "languages" ? (
            <div className="card admin-panel">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Base du catalogue</p>
                  <h2 className="section-title">CRUD des langages</h2>
                </div>
                <button type="button" className="btn btn-ghost" onClick={resetLanguageForm}>
                  Nouveau langage
                </button>
              </div>

              <form className="page-stack" style={{ gap: 12 }} onSubmit={handleLanguageSubmit}>
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  }}
                >
                  <div>
                    <label htmlFor="admin-language-code" className="field-label">
                      Code
                    </label>
                    <input
                      id="admin-language-code"
                      className="field"
                      value={languageForm.code}
                      placeholder="python"
                      onChange={(event) =>
                        setLanguageForm((current) => ({
                          ...current,
                          code: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="admin-language-name" className="field-label">
                      Nom
                    </label>
                    <input
                      id="admin-language-name"
                      className="field"
                      value={languageForm.name}
                      placeholder="Python"
                      onChange={(event) =>
                        setLanguageForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saveLanguageMutation.isPending}
                  >
                    {saveLanguageMutation.isPending
                      ? "Enregistrement..."
                      : editingLanguageId
                        ? "Mettre a jour"
                        : "Ajouter"}
                  </button>
                  {editingLanguageId ? (
                    <button type="button" className="btn btn-ghost" onClick={resetLanguageForm}>
                      Annuler
                    </button>
                  ) : null}
                </div>
              </form>

              {languages.map((language) => (
                <div key={language.id} className="admin-row">
                  <div className="admin-avatar">{language.code.slice(0, 2).toUpperCase()}</div>
                  <div className="admin-meta">
                    <strong>{language.name}</strong>
                    <span className="text-muted">{language.code}</span>
                    <span className="attachment-meta">
                      {`${language.courseCount} cours rattache(s)`}
                    </span>
                  </div>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => loadLanguageForEdit(language)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setConfirmState({ type: "delete-language", language })}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}

              {languages.length === 0 ? (
                <InlineEmpty message="Aucun langage n'est encore configure." />
              ) : null}
            </div>
          ) : null}

          {activeTab === "catalog" ? (
            <div className="admin-catalog-grid">
              <div className="card admin-panel admin-catalog-panel">
                <div className="section-head">
                  <div>
                    <p className="section-kicker">Cours</p>
                    <h2 className="section-title">CRUD des cours</h2>
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={resetCourseForm}>
                    Nouveau
                  </button>
                </div>

                <form className="admin-catalog-form" onSubmit={handleCourseSubmit}>
                  <div className="admin-catalog-form-grid">
                    <div className="admin-catalog-field">
                      <label htmlFor="admin-course-code" className="field-label">
                        Code
                      </label>
                      <input
                        id="admin-course-code"
                        className="field"
                        value={courseForm.code}
                        placeholder="PYTHON-101"
                        onChange={(event) =>
                          setCourseForm((current) => ({
                            ...current,
                            code: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="admin-catalog-field">
                      <label htmlFor="admin-course-language" className="field-label">
                        Langage
                      </label>
                      <select
                        id="admin-course-language"
                        className="field"
                        value={courseLanguageValue}
                        onChange={(event) =>
                          setCourseForm((current) => ({
                            ...current,
                            languageId: event.target.value,
                          }))
                        }
                      >
                        {languages.map((language) => (
                          <option key={language.id} value={language.id}>
                            {language.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="admin-catalog-field">
                    <label htmlFor="admin-course-title" className="field-label">
                      Titre
                    </label>
                    <input
                      id="admin-course-title"
                      className="field"
                      value={courseForm.title}
                      placeholder="Programmation Python"
                      onChange={(event) =>
                        setCourseForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-catalog-field">
                    <label htmlFor="admin-course-description" className="field-label">
                      Description
                    </label>
                    <textarea
                      id="admin-course-description"
                      className="field"
                      rows={3}
                      value={courseForm.description}
                      placeholder="Resume du parcours et des notions travaillees"
                      onChange={(event) =>
                        setCourseForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="admin-catalog-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saveCourseMutation.isPending}
                    >
                      {saveCourseMutation.isPending
                        ? "Enregistrement..."
                        : editingCourseId
                          ? "Mettre a jour"
                          : "Ajouter"}
                    </button>
                    {editingCourseId ? (
                      <button type="button" className="btn btn-ghost" onClick={resetCourseForm}>
                        Annuler
                      </button>
                    ) : null}
                  </div>
                </form>

                <div className="admin-list admin-catalog-list">{courses.map((course) => (
                  <div
                    key={course.id}
                    className="admin-row admin-catalog-row"
                    style={effectiveSelectedCourseId === course.id ? selectedRowStyle : undefined}
                  >
                    <div className="admin-avatar">{course.title.slice(0, 2).toUpperCase()}</div>
                     <div className="admin-meta">
                        <strong>{course.title}</strong>
                        <span className="text-muted">{course.description?.trim() || "Aucune description"}</span>
                        <span className="attachment-meta">
                          {`${course.languageName ?? course.languageCode ?? "Langage"} · ${course.lessonCount} leçons · ${course.attachmentCount} ressource(s) · ${course.enrolledUsersCount} inscrits · ${course.completedUsersCount} complétés`}
                        </span>
                      </div>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setSelectedCourseId(course.id)}
                      >
                        Ouvrir
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => loadCourseForEdit(course)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => setConfirmState({ type: "delete-course", course })}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
                </div>

                {courses.length === 0 ? (
                  <InlineEmpty message="Cree d'abord un cours pour commencer a structurer le contenu." />
                ) : null}
              </div>

              <div className="card admin-panel admin-catalog-panel">
                <div className="section-head">
                  <div>
                    <p className="section-kicker">Lecons</p>
                    <h2 className="section-title">
                      {selectedCourse ? `Cours: ${selectedCourse.title}` : "CRUD des lecons"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => void resetLessonFormAsync()}
                    disabled={!selectedCourse}
                  >
                    Nouvelle
                  </button>
                </div>

                {selectedCourse ? (
                  <>
                    <form className="admin-catalog-form" onSubmit={handleLessonSubmit}>
                      <div className="admin-catalog-field">
                        <label htmlFor="admin-lesson-title" className="field-label">
                          Titre
                        </label>
                        <input
                          id="admin-lesson-title"
                          className="field"
                          value={lessonForm.title}
                          placeholder="Variables et types"
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="admin-catalog-field">
                        <label htmlFor="admin-lesson-order" className="field-label">
                          Ordre
                        </label>
                        <input
                          id="admin-lesson-order"
                          className="field"
                          type="number"
                          min={1}
                          value={lessonForm.orderIndex}
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              orderIndex: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="admin-catalog-field">
                        <label htmlFor="admin-lesson-content" className="field-label">
                          Contenu
                        </label>
                        <textarea
                          id="admin-lesson-content"
                          className="field"
                          rows={6}
                          value={lessonForm.content}
                          placeholder="Contenu markdown de la lecon"
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              content: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="admin-catalog-field">
                        <label htmlFor="admin-lesson-starter" className="field-label">
                          Code de depart
                        </label>
                        <textarea
                          id="admin-lesson-starter"
                          className="field"
                          rows={5}
                          value={lessonForm.starterCode}
                          placeholder="Code propose a l'apprenant"
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              starterCode: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="admin-catalog-form-grid">
                        <div className="admin-catalog-field">
                          <label htmlFor="admin-lesson-editor-language" className="field-label">
                            Langage editeur
                          </label>
                          <input
                            id="admin-lesson-editor-language"
                            className="field"
                            value={lessonForm.editorLanguage}
                            placeholder="python"
                            onChange={(event) =>
                              setLessonForm((current) => ({
                                ...current,
                                editorLanguage: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="admin-catalog-field">
                          <label htmlFor="admin-lesson-execution-type" className="field-label">
                            Type d'execution
                          </label>
                          <input
                            id="admin-lesson-execution-type"
                            className="field"
                            value={lessonForm.executionType}
                            placeholder="console"
                            onChange={(event) =>
                              setLessonForm((current) => ({
                                ...current,
                                executionType: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="admin-catalog-field">
                        <label htmlFor="admin-lesson-output" className="field-label">
                          Sortie d'exemple
                        </label>
                        <textarea
                          id="admin-lesson-output"
                          className="field"
                          rows={4}
                          value={lessonForm.sampleOutput}
                          placeholder="Sortie attendue ou exemple de console"
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              sampleOutput: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="admin-catalog-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saveLessonMutation.isPending}
                        >
                          {saveLessonMutation.isPending
                            ? "Enregistrement..."
                            : editingLessonId
                              ? "Mettre a jour"
                              : "Ajouter"}
                        </button>
                        {editingLessonId ? (
                          <button type="button" className="btn btn-ghost" onClick={() => void resetLessonFormAsync()}>
                            Annuler
                          </button>
                        ) : null}
                      </div>
                    </form>

                    <div className="admin-list admin-catalog-list">{lessonsQuery.isLoading ? (
                      <p className="text-muted">Chargement des lecons...</p>
                    ) : lessons.length > 0 ? (
                      lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="admin-row admin-catalog-row"
                          style={effectiveSelectedLessonId === lesson.id ? selectedRowStyle : undefined}
                        >
                          <div className="admin-avatar">{String(lesson.orderIndex).padStart(2, "0")}</div>
                          <div className="admin-meta">
                            <strong>{lesson.title}</strong>
                            <span className="text-muted lesson-excerpt">
                              {makeLessonExcerpt(lesson.content)}
                            </span>
                            <span className="attachment-meta">
                              {`${lesson.exerciseCount} exercice(s) · ${lesson.editorLanguage || selectedCourse.languageCode || "editeur"} `}
                            </span>
                          </div>
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => setSelectedLessonId(lesson.id)}
                            >
                              Ouvrir
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => loadLessonForEdit(lesson)}
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => setConfirmState({ type: "delete-lesson", lesson })}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <InlineEmpty message="Ce cours ne contient encore aucune lecon." />
                    )}</div>
                  </>
                ) : (
                  <InlineEmpty message="Selectionne ou cree d'abord un cours pour gerer ses lecons." />
                )}
              </div>

              <div className="card admin-panel admin-catalog-panel">
                <div className="section-head">
                  <div>
                    <p className="section-kicker">Exercices</p>
                    <h2 className="section-title">
                      {selectedLesson ? `Lecon: ${selectedLesson.title}` : "CRUD des exercices"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => void resetExerciseFormAsync()}
                    disabled={!selectedLesson}
                  >
                    Nouveau
                  </button>
                </div>

                {selectedLesson ? (
                  <>
                    <form className="admin-catalog-form" onSubmit={handleExerciseSubmit}>
                      <div className="admin-catalog-form-grid">
                        <div className="admin-catalog-field">
                          <label htmlFor="admin-exercise-type" className="field-label">
                            Type
                          </label>
                          <select
                            id="admin-exercise-type"
                            className="field"
                            value={exerciseForm.type}
                            onChange={(event) =>
                              setExerciseForm((current) => {
                                const nextType = normalizeExerciseType(event.target.value);
                                return {
                                  ...current,
                                  type: nextType,
                                  choicesText:
                                    nextType === "TRUE_FALSE" && !current.choicesText.trim()
                                      ? "true\nfalse"
                                      : current.choicesText,
                                };
                              })
                            }
                          >
                            <option value="MCQ">MCQ</option>
                            <option value="CODE">CODE</option>
                            <option value="TRUE_FALSE">TRUE_FALSE</option>
                          </select>
                        </div>
                        <div className="admin-catalog-field">
                          <label htmlFor="admin-exercise-order" className="field-label">
                            Ordre
                          </label>
                          <input
                            id="admin-exercise-order"
                            className="field"
                            type="number"
                            min={1}
                            value={exerciseForm.orderIndex}
                            onChange={(event) =>
                              setExerciseForm((current) => ({
                                ...current,
                                orderIndex: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="admin-catalog-field">
                        <label htmlFor="admin-exercise-question" className="field-label">
                          Question
                        </label>
                        <textarea
                          id="admin-exercise-question"
                          className="field"
                          rows={4}
                          value={exerciseForm.question}
                          placeholder="Question ou consigne de l'exercice"
                          onChange={(event) =>
                            setExerciseForm((current) => ({
                              ...current,
                              question: event.target.value,
                            }))
                          }
                        />
                      </div>

                      {exerciseForm.type !== "CODE" ? (
                        <div className="admin-catalog-field">
                          <label htmlFor="admin-exercise-choices" className="field-label">
                            Choix (un par ligne)
                          </label>
                          <textarea
                            id="admin-exercise-choices"
                            className="field"
                            rows={4}
                            value={exerciseForm.choicesText}
                            placeholder="Choix A&#10;Choix B&#10;Choix C"
                            onChange={(event) =>
                              setExerciseForm((current) => ({
                                ...current,
                                choicesText: event.target.value,
                              }))
                            }
                          />
                        </div>
                      ) : null}

                      <div className="admin-catalog-field">
                        <label htmlFor="admin-exercise-answer" className="field-label">
                          Reponse attendue
                        </label>
                        <input
                          id="admin-exercise-answer"
                          className="field"
                          value={exerciseForm.answer}
                          placeholder={exerciseForm.type === "CODE" ? "print('Hello')" : "Choix B"}
                          onChange={(event) =>
                            setExerciseForm((current) => ({
                              ...current,
                              answer: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="admin-catalog-field">
                        <label htmlFor="admin-exercise-explanation" className="field-label">
                          Explication
                        </label>
                        <textarea
                          id="admin-exercise-explanation"
                          className="field"
                          rows={3}
                          value={exerciseForm.explanation}
                          placeholder="Correction ou indice apres soumission"
                          onChange={(event) =>
                            setExerciseForm((current) => ({
                              ...current,
                              explanation: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="admin-catalog-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saveExerciseMutation.isPending}
                        >
                          {saveExerciseMutation.isPending
                            ? "Enregistrement..."
                            : editingExerciseId
                              ? "Mettre a jour"
                              : "Ajouter"}
                        </button>
                        {editingExerciseId ? (
                          <button type="button" className="btn btn-ghost" onClick={() => void resetExerciseFormAsync()}>
                            Annuler
                          </button>
                        ) : null}
                      </div>
                    </form>

                    <div className="admin-list admin-catalog-list">
                      <div className="admin-catalog-list-header">
                        <span className="badge badge-ghost">
                          {`${totalExercisesForSelectedCourse} exercice(s) dans ce cours`}
                        </span>
                      </div>

                      {exercisesQuery.isLoading ? (
                        <p className="text-muted">Chargement des exercices...</p>
                      ) : exercises.length > 0 ? (
                        exercises.map((exercise) => (
                        <div key={exercise.id} className="admin-row admin-catalog-row">
                          <div className="admin-avatar">{exercise.type.slice(0, 2)}</div>
                          <div className="admin-meta">
                            <strong>{exercise.question}</strong>
                            <span className="text-muted">
                              {exercise.explanation?.trim() || "Sans explication pour le moment"}
                            </span>
                            <span className="attachment-meta">
                              {`Ordre ${exercise.orderIndex} · Reponse: ${exercise.answer}`}
                            </span>
                          </div>
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => loadExerciseForEdit(exercise)}
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => setConfirmState({ type: "delete-exercise", exercise })}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                        ))
                      ) : (
                        <InlineEmpty message="Cette lecon ne contient encore aucun exercice." />
                      )}
                    </div>
                  </>
                ) : (
                  <InlineEmpty message="Selectionne d'abord une lecon pour gerer ses exercices." />
                )}
              </div>
            </div>
          ) : null}

          {activeTab === "resources" ? (
            <div className="card admin-panel">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Supports de cours</p>
                  <h2 className="section-title">Gestion des pieces jointes</h2>
                </div>
                <span className="badge badge-ghost">{`${attachments.length} fichier(s)`}</span>
              </div>

              {courses.length > 0 ? (
                <>
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
                          value={effectiveSelectedCourseId ?? ""}
                          onChange={(event) => setSelectedCourseId(Number(event.target.value))}
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
                  </form>

                  {attachmentsQuery.isLoading ? (
                    <p className="text-muted">Chargement des pieces jointes...</p>
                  ) : attachments.length > 0 ? (
                    attachments.map((attachment) => (
                      <div key={attachment.id} className="admin-row">
                        <div className="admin-avatar">PJ</div>
                        <div className="admin-meta">
                          <strong>{attachment.originalName}</strong>
                          <span className="text-muted">
                            {selectedCourse?.title ?? "Cours"}
                          </span>
                          <span className="attachment-meta">
                            {`${formatBytes(attachment.sizeBytes)} · ${formatDate(attachment.uploadedAt)}`}
                          </span>
                        </div>
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() =>
                              void handleAttachmentDownload({
                                ...attachment,
                                courseTitle: selectedCourse?.title ?? "Cours",
                              })
                            }
                          >
                            Telecharger
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() =>
                              setConfirmState({
                                type: "delete-attachment",
                                attachment: {
                                  ...attachment,
                                  courseTitle: selectedCourse?.title ?? "Cours",
                                },
                              })
                            }
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <InlineEmpty message="Aucune piece jointe n'est encore disponible pour ce cours." />
                  )}
                </>
              ) : (
                <InlineEmpty message="Cree d'abord un cours avant d'y associer des ressources." />
              )}
            </div>
          ) : null}
        </section>
      </div>

      <ConfirmModal
        isOpen={confirmState !== null}
        title={getConfirmTitle(confirmState)}
        message={getConfirmMessage(confirmState)}
        confirmLabel="Confirmer"
        dangerous
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          if (!confirmState) {
            return;
          }

          switch (confirmState.type) {
            case "delete-user":
              deleteUserMutation.mutate(confirmState.user.id);
              return;
            case "delete-language":
              deleteLanguageMutation.mutate(confirmState.language.id);
              return;
            case "delete-course":
              deleteCourseMutation.mutate(confirmState.course.id);
              return;
            case "delete-lesson":
              deleteLessonMutation.mutate(confirmState.lesson.id);
              return;
            case "delete-exercise":
              deleteExerciseMutation.mutate(confirmState.exercise.id);
              return;
            case "delete-attachment":
              deleteAttachmentMutation.mutate(confirmState.attachment);
              return;
            default:
          }
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

function InlineEmpty({ message }: { message: string }) {
  return (
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
      {message}
    </div>
  );
}

function getConfirmTitle(confirmState: ConfirmState) {
  switch (confirmState?.type) {
    case "delete-user":
      return "Supprimer cet utilisateur ?";
    case "delete-language":
      return "Supprimer ce langage ?";
    case "delete-course":
      return "Supprimer ce cours ?";
    case "delete-lesson":
      return "Supprimer cette lecon ?";
    case "delete-exercise":
      return "Supprimer cet exercice ?";
    case "delete-attachment":
      return "Supprimer cette piece jointe ?";
    default:
      return "";
  }
}

function getConfirmMessage(confirmState: ConfirmState) {
  switch (confirmState?.type) {
    case "delete-user":
      return `Le compte ${confirmState.user.username} sera supprime definitivement.`;
    case "delete-language":
      return `${confirmState.language.name} sera retire de la liste des langages disponibles.`;
    case "delete-course":
      return `${confirmState.course.title} ainsi que ses lecons, exercices, ressources et progressions liees seront supprimes.`;
    case "delete-lesson":
      return `${confirmState.lesson.title} ainsi que ses exercices et tentatives liees seront supprimes.`;
    case "delete-exercise":
      return `L'exercice "${confirmState.exercise.question}" sera supprime avec ses tentatives.`;
    case "delete-attachment":
      return `${confirmState.attachment.originalName} sera retire du cours ${confirmState.attachment.courseTitle}.`;
    default:
      return "";
  }
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

function splitChoices(value: string) {
  return value
    .split(/\r?\n/)
    .map((choice) => choice.trim())
    .filter(Boolean);
}

function normalizeExerciseType(value: string): "MCQ" | "CODE" | "TRUE_FALSE" {
  const normalized = value.trim().toUpperCase();
  if (normalized === "CODE") {
    return "CODE";
  }
  if (normalized === "TRUE_FALSE") {
    return "TRUE_FALSE";
  }
  return "MCQ";
}

const selectedRowStyle = {
  background: "var(--teal-soft)",
  borderRadius: "var(--r-md)",
  paddingInline: 12,
  borderTopColor: "transparent",
} as const;
