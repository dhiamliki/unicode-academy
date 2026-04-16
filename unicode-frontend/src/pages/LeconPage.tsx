import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate, useParams } from "react-router-dom";
import { getCourses } from "../api/courses";
import {
  completeLesson,
  getMyLessonProgress,
  http,
  runCode,
  type LessonProgressDto,
} from "../api/http";
import AiAssistant from "../components/AiAssistant";
import CodeEditor from "../components/CodeEditor";
import PratiqueInline, {
  type PracticeChallengeView,
  type PracticeRunAssessment,
} from "../components/PratiqueInline";
import {
  buildUnitExercisesPath,
  buildResolvedLessonPath,
  buildUnits,
  findUnitById,
  resolveLessonForUnit,
  type CourseLesson,
  type LessonExercise,
} from "../lib/academy";
import { queryKeys } from "../lib/queryKeys";
import { getErrorMessage } from "../utils/errorMessage";
import { saveRecentLesson } from "../utils/recentLessons";

type LessonDetail = CourseLesson & {
  exercises: LessonExercise[];
  [key: string]: unknown;
};

type WebTab = "html" | "css" | "js";

type WebPlaygroundState = {
  html: string;
  css: string;
  js: string;
};

type RunFeedback = {
  stdout: string;
  stderr: string;
  compileOutput: string;
};

type EditorSnippetLanguage = "python" | "html" | "css" | "js" | "java";

type PracticeChallengeFields = Partial<
  Pick<
    PracticeChallengeView,
    "title" | "objective" | "instructions" | "expectedOutput" | "hint" | "starterCode"
  >
>;

const WEB_LANGUAGES = new Set(["html", "css", "javascript"]);

export default function LeconPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId, unitId, lessonId } = useParams<{
    courseId: string;
    unitId: string;
    lessonId?: string;
  }>();

  const numericCourseId = Number(courseId);
  const numericLessonId = Number(lessonId);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [phase, setPhase] = useState<"lesson" | "pratique">("lesson");
  const [activeTab, setActiveTab] = useState<WebTab>("html");
  const [previewDoc, setPreviewDoc] = useState("");
  const [consoleText, setConsoleText] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [lastRunFeedback, setLastRunFeedback] = useState<RunFeedback | null>(null);
  const [hasRunCode, setHasRunCode] = useState(false);
  const [previewRatio, setPreviewRatio] = useState(35);
  const [playgroundByLesson, setPlaygroundByLesson] = useState<Record<number, WebPlaygroundState>>({});
  const [rawCodeByLesson, setRawCodeByLesson] = useState<Record<number, string>>({});
  const [editorCode, setEditorCode] = useState("");
  const [editorLang, setEditorLang] = useState<EditorSnippetLanguage>("python");
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const resizeRef = useRef<{ startY: number; startRatio: number } | null>(null);
  const handleRunShortcut = useEffectEvent(() => {
    void handleRunCode();
  });

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses(),
    queryFn: () => getCourses(),
  });

  const lessonProgressQuery = useQuery({
    queryKey: queryKeys.lessonProgress,
    queryFn: getMyLessonProgress,
  });

  const courseLessonsQuery = useQuery({
    queryKey: queryKeys.courseLessons(numericCourseId),
    enabled: Number.isFinite(numericCourseId),
    queryFn: async () => {
      const response = await http.get<CourseLesson[]>(`/api/courses/${numericCourseId}/lessons`);
      return response.data ?? [];
    },
  });

  const course = useMemo(
    () => (coursesQuery.data ?? []).find((item) => item.id === numericCourseId) ?? null,
    [coursesQuery.data, numericCourseId]
  );

  const progressItems = useMemo(
    () =>
      ((lessonProgressQuery.data?.data ?? []) as LessonProgressDto[]).filter(
        (item) => item.courseId === numericCourseId
      ),
    [lessonProgressQuery.data?.data, numericCourseId]
  );

  const units = useMemo(() => {
    return buildUnits(courseLessonsQuery.data ?? [], progressItems);
  }, [courseLessonsQuery.data, progressItems]);

  const selectedUnit = useMemo(() => findUnitById(units, unitId), [unitId, units]);
  const selectedUnitLessonIds = selectedUnit?.lessons.map((lesson) => lesson.id).join(",") ?? "none";

  const lessonDetailsQuery = useQuery({
    queryKey: queryKeys.lessonGroup(numericCourseId, selectedUnit?.id ?? "none", selectedUnitLessonIds),
    enabled: Boolean(selectedUnit),
    queryFn: async () => {
      const responses = await Promise.all(
        (selectedUnit?.lessons ?? []).map((lesson) =>
          http.get<LessonDetail>(`/api/lessons/${lesson.id}`)
        )
      );

      return responses.map((response) => response.data);
    },
  });

  useEffect(() => {
    const firstError = coursesQuery.error ?? lessonProgressQuery.error ?? courseLessonsQuery.error;

    if (firstError) {
      toast.error(getErrorMessage(firstError, "Impossible de charger cette unite."));
    }
  }, [courseLessonsQuery.error, coursesQuery.error, lessonProgressQuery.error]);

  useEffect(() => {
    if (lessonDetailsQuery.error) {
      toast.error(getErrorMessage(lessonDetailsQuery.error, "Impossible de charger le contenu de la lecon."));
    }
  }, [lessonDetailsQuery.error]);

  useEffect(() => {
    if (!selectedUnit) {
      return;
    }

    if (
      Number.isFinite(numericLessonId) &&
      selectedUnit.lessons.some((lesson) => lesson.id === numericLessonId)
    ) {
      setCurrentLessonId(numericLessonId);
      return;
    }

    const nextLessonForUnit = resolveLessonForUnit(selectedUnit, progressItems);
    if (nextLessonForUnit) {
      setCurrentLessonId(nextLessonForUnit.id);
    }
  }, [numericLessonId, progressItems, selectedUnit]);

  const detailedLessons = lessonDetailsQuery.data ?? [];
  const currentLesson =
    detailedLessons.find((lesson) => lesson.id === currentLessonId) ?? detailedLessons[0] ?? null;
  const currentLessonIndex = detailedLessons.findIndex((lesson) => lesson.id === currentLesson?.id);
  const previousLesson = currentLessonIndex > 0 ? detailedLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < detailedLessons.length - 1
      ? detailedLessons[currentLessonIndex + 1]
      : null;
  const courseLessonIndex = (courseLessonsQuery.data ?? []).findIndex(
    (lesson) => lesson.id === currentLesson?.id
  );

  useEffect(() => {
    if (
      !selectedUnit ||
      !Number.isFinite(numericCourseId) ||
      !currentLessonId ||
      numericLessonId === currentLessonId
    ) {
      return;
    }

    navigate(buildResolvedLessonPath(numericCourseId, selectedUnit, currentLessonId), {
      replace: true,
    });
  }, [currentLessonId, navigate, numericCourseId, numericLessonId, selectedUnit]);

  useEffect(() => {
    if (!currentLesson || !course || !selectedUnit) {
      return;
    }

    saveRecentLesson({
      lessonId: currentLesson.id,
      courseId: numericCourseId,
      unitId: selectedUnit.id,
      lessonTitle: currentLesson.title,
      courseTitle: course.title,
      languageCode: course.languageCode ?? "",
      visitedAt: Date.now(),
    });
  }, [course, currentLesson, numericCourseId, selectedUnit]);

  const canonicalLanguage = normalizeLanguage(
    currentLesson?.practiceLanguage ?? currentLesson?.editorLanguage
  );
  const isWebLesson =
    canonicalLanguage === "html" ||
    canonicalLanguage === "css" ||
    canonicalLanguage === "javascript";
  const lessonStarterCode = useMemo(
    () =>
      currentLesson
        ? resolveLessonStarterCode(currentLesson, canonicalLanguage)
        : defaultStarterForLanguage(canonicalLanguage),
    [canonicalLanguage, currentLesson]
  );

  useEffect(() => {
    if (isWebLesson) {
      setEditorLang(activeTab);
    } else if (canonicalLanguage === "python") {
      setEditorLang("python");
    } else {
      setEditorLang("java");
    }

    setEditorCode("");
  }, [activeTab, canonicalLanguage, currentLesson?.id, isWebLesson]);

  useEffect(() => {
    if (!currentLesson || !isWebLesson) {
      return;
    }

    setPlaygroundByLesson((current) => {
      if (current[currentLesson.id]) {
        return current;
      }

      return {
        ...current,
        [currentLesson.id]: buildInitialWebPlayground(currentLesson, canonicalLanguage),
      };
    });

    setActiveTab(mapLanguageToTab(canonicalLanguage));
  }, [canonicalLanguage, currentLesson, isWebLesson]);

  useEffect(() => {
    if (!currentLesson || isWebLesson) {
      return;
    }

    setRawCodeByLesson((current) => {
      if (current[currentLesson.id] !== undefined) {
        return current;
      }

      return {
        ...current,
        [currentLesson.id]: lessonStarterCode,
      };
    });
  }, [currentLesson, isWebLesson, lessonStarterCode]);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!resizeRef.current) {
        return;
      }

      const delta = event.clientY - resizeRef.current.startY;
      const ratio = resizeRef.current.startRatio - (delta / window.innerHeight) * 100;
      setPreviewRatio(Math.max(22, Math.min(55, ratio)));
    }

    function handleMouseUp() {
      resizeRef.current = null;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        handleRunShortcut();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    setConsoleText("");
    setConsoleOutput("");
    setLastRunFeedback(null);
    setHasRunCode(false);
    setPreviewDoc("");
  }, [currentLesson?.id]);

  useEffect(() => {
    if (phase === "lesson") {
      setAiOpen(false);
    }
  }, [phase]);

  const practiceChallenge = useMemo(() => {
    if (!currentLesson) {
      return null;
    }

    return resolvePracticeChallenge({
      lesson: currentLesson,
      language: canonicalLanguage,
    });
  }, [canonicalLanguage, currentLesson]);
  const currentRunError = formatRunError(lastRunFeedback);
  const practiceRunAssessment = useMemo(
    () =>
      evaluatePracticeRunAssessment({
        challenge: phase === "pratique" ? practiceChallenge : null,
        hasRunCode,
        isRunning,
        isWebLesson,
        consoleOutput,
        currentError: currentRunError,
      }),
    [consoleOutput, currentRunError, hasRunCode, isRunning, isWebLesson, phase, practiceChallenge]
  );

  if (!Number.isFinite(numericCourseId)) {
    return <InvalidUnitState onBack={() => navigate("/apprendre")} />;
  }

  if (
    coursesQuery.isLoading ||
    lessonProgressQuery.isLoading ||
    courseLessonsQuery.isLoading ||
    lessonDetailsQuery.isLoading
  ) {
    return <LoadingLessonState />;
  }

  if (!course || !selectedUnit || !currentLesson || !practiceChallenge) {
    return <InvalidUnitState onBack={() => navigate(`/apprendre/${numericCourseId}`)} />;
  }

  if (selectedUnit.state === "locked") {
    return <InvalidUnitState onBack={() => navigate(`/apprendre/${numericCourseId}`)} />;
  }

  const unit = selectedUnit;
  const playground = playgroundByLesson[currentLesson.id];
  const rawCode = !isWebLesson
    ? rawCodeByLesson[currentLesson.id] ?? lessonStarterCode
    : "";
  const editorValue = isWebLesson ? playground?.[activeTab] ?? "" : rawCode;
  const lessonCount = (courseLessonsQuery.data ?? []).length;
  const lessonNumber = courseLessonIndex >= 0 ? courseLessonIndex + 1 : 1;
  const breadcrumbLanguage =
    course.languageName ||
    course.languageCode ||
    course.title;
  const codeEditorValue = editorCode || editorValue;
  const codeEditorLanguage = editorCode
    ? editorLang
    : resolveEditorLanguage(isWebLesson, activeTab, canonicalLanguage);
  const practiceCodeSnapshot = isWebLesson
    ? formatAiPracticeCodeSnapshot(
        playground ?? buildInitialWebPlayground(currentLesson, canonicalLanguage)
      )
    : rawCode;
  const consoleDisplayText = getConsoleDisplayText({
    hasRunCode,
    isRunning,
    phase,
    isWebLesson,
    consoleText,
  });
  const exercisePath = buildUnitExercisesPath(numericCourseId, unit.id);
  const lessonExpectedNote = getLessonExpectedNote(practiceChallenge);

  function loadCodeBlockIntoEditor(code: string, className?: string) {
    if (!currentLesson) {
      return;
    }

    const snippetLanguage = resolveSnippetLanguage(className, canonicalLanguage);
    setEditorCode(code);
    setEditorLang(snippetLanguage);

    if (snippetLanguage === "html" || snippetLanguage === "css" || snippetLanguage === "js") {
      const nextTab: WebTab = snippetLanguage === "js" ? "js" : snippetLanguage;
      setActiveTab(nextTab);
      setPlaygroundByLesson((current) => ({
        ...current,
        [currentLesson.id]: {
          ...(current[currentLesson.id] ?? buildInitialWebPlayground(currentLesson, canonicalLanguage)),
          [nextTab]: code,
        },
      }));
    } else {
      setRawCodeByLesson((current) => ({
        ...current,
        [currentLesson.id]: code,
      }));
    }

    setPreviewDoc("");
    setConsoleText("");
    setConsoleOutput("");
    setLastRunFeedback(null);
    setHasRunCode(false);
    toast.success("Code chargé dans l'éditeur.");
  }

  async function handleRunCode() {
    if (!currentLesson) {
      return;
    }

    if (isWebLesson) {
      const nextPlayground =
        playgroundByLesson[currentLesson.id] ??
        buildInitialWebPlaygroundFromStarter(lessonStarterCode, canonicalLanguage);
      setPreviewDoc(buildWebDocument(nextPlayground));
      setConsoleText("");
      setConsoleOutput("");
      setLastRunFeedback(null);
      setHasRunCode(true);
      return;
    }

    const code = rawCodeByLesson[currentLesson.id] ?? lessonStarterCode;
    setIsRunning(true);
    try {
      const result = await runCode({
        language: canonicalLanguage,
        code,
      });

      setConsoleText(formatConsoleOutput(result.stdout, result.stderr, result.compileOutput));
      setConsoleOutput(result.stdout ?? "");
      setLastRunFeedback({
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
        compileOutput: result.compileOutput ?? "",
      });
      setHasRunCode(true);
    } catch (error) {
      const message = getErrorMessage(error, "Execution impossible.");
      toast.error(message);
      setConsoleText(`> ${message}`);
      setConsoleOutput("");
      setLastRunFeedback({
        stdout: "",
        stderr: message,
        compileOutput: "",
      });
      setHasRunCode(false);
    } finally {
      setIsRunning(false);
    }
  }

  function handleCodeChange(nextValue: string) {
    if (!currentLesson) {
      return;
    }

    setHasRunCode(false);
    setConsoleText("");
    setConsoleOutput("");
    setLastRunFeedback(null);
    setPreviewDoc("");

    if (isWebLesson) {
      setPlaygroundByLesson((current) => ({
        ...current,
        [currentLesson.id]: {
          ...(current[currentLesson.id] ?? buildInitialWebPlayground(currentLesson, canonicalLanguage)),
          [activeTab]: nextValue,
        },
      }));
      return;
    }

    setRawCodeByLesson((current) => ({
      ...current,
      [currentLesson.id]: nextValue,
    }));
  }

  function handleEditorChange(nextValue: string) {
    if (editorCode) {
      setEditorCode(nextValue);
    }

    handleCodeChange(nextValue);
  }

  function handleResetCode() {
    if (!currentLesson) {
      return;
    }

    const currentPracticeChallenge = practiceChallenge;
    const starterCode =
      phase === "pratique" && currentPracticeChallenge
        ? currentPracticeChallenge.starterCode
        : lessonStarterCode;

    if (isWebLesson) {
      const nextPlayground = buildInitialWebPlaygroundFromStarter(starterCode, canonicalLanguage);
      const nextTab = mapLanguageToTab(canonicalLanguage);
      setPlaygroundByLesson((current) => ({
        ...current,
        [currentLesson.id]: nextPlayground,
      }));
      setActiveTab(nextTab);
      setEditorLang(nextTab);
      setEditorCode(nextPlayground[nextTab]);
    } else {
      setRawCodeByLesson((current) => ({
        ...current,
        [currentLesson.id]: starterCode,
      }));
      setEditorLang(resolveEditorLanguage(false, activeTab, canonicalLanguage));
      setEditorCode(starterCode);
      setConsoleText("");
    }

    setPreviewDoc("");
    setConsoleOutput("");
    setLastRunFeedback(null);
    setHasRunCode(false);
  }

  function enterPracticePhase() {
    if (!currentLesson || !practiceChallenge) {
      return;
    }

    if (isWebLesson) {
      const lessonPlayground = buildInitialWebPlaygroundFromStarter(lessonStarterCode, canonicalLanguage);
      const currentPlayground = playgroundByLesson[currentLesson.id] ?? lessonPlayground;
      const practicePlayground = buildInitialWebPlaygroundFromStarter(
        practiceChallenge.starterCode,
        canonicalLanguage
      );
      const keepCurrentPlayground =
        arePlaygroundsEqual(currentPlayground, practicePlayground) ||
        !arePlaygroundsEqual(currentPlayground, lessonPlayground);
      const nextPlayground = keepCurrentPlayground ? currentPlayground : practicePlayground;
      const nextTab = keepCurrentPlayground ? activeTab : mapLanguageToTab(canonicalLanguage);
      setPlaygroundByLesson((current) => ({
        ...current,
        [currentLesson.id]: nextPlayground,
      }));
      setActiveTab(nextTab);
      setEditorLang(nextTab);
      setEditorCode(nextPlayground[nextTab]);
    } else {
      const currentCode = rawCodeByLesson[currentLesson.id] ?? lessonStarterCode;
      const nextCode = shouldPreserveCurrentPracticeCode({
        currentCode,
        practiceStarter: practiceChallenge.starterCode,
        lessonStarter: lessonStarterCode,
        language: canonicalLanguage,
      })
        ? currentCode
        : practiceChallenge.starterCode;

      setRawCodeByLesson((current) => ({
        ...current,
        [currentLesson.id]: nextCode,
      }));
      setEditorLang(resolveEditorLanguage(false, activeTab, canonicalLanguage));
      setEditorCode(nextCode);
    }

    setConsoleText("");
    setConsoleOutput("");
    setLastRunFeedback(null);
    setPreviewDoc("");
    setHasRunCode(false);
    setPhase("pratique");
  }

  function returnToLessonPhase() {
    setPhase("lesson");
    setConsoleText("");
    setConsoleOutput("");
    setLastRunFeedback(null);
    setPreviewDoc("");
    setHasRunCode(false);
  }

  async function markCurrentLessonComplete() {
    if (!currentLesson || isCompleting) {
      return true;
    }

    setIsCompleting(true);
    try {
      await completeLesson(currentLesson.id);
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: queryKeys.lessonProgress }),
        queryClient.invalidateQueries({ queryKey: queryKeys.progress }),
        queryClient.invalidateQueries({ queryKey: queryKeys.courseLessons(numericCourseId) }),
      ]);
      await Promise.allSettled([
        queryClient.refetchQueries({ queryKey: queryKeys.lessonProgress, exact: true, type: "active" }),
        queryClient.refetchQueries({ queryKey: queryKeys.progress, exact: true, type: "active" }),
      ]);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Impossible d'enregistrer cette lecon."));
      return false;
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleNextLesson() {
    if (!nextLesson) {
      return;
    }

    const completed = await markCurrentLessonComplete();
    if (!completed) {
      return;
    }

    startTransition(() => {
      setPhase("lesson");
      setCurrentLessonId(nextLesson.id);
      setConsoleText("");
      setConsoleOutput("");
      setLastRunFeedback(null);
      setPreviewDoc("");
      setHasRunCode(false);
    });
  }

  return (
    <div
      className="fullscreen-page"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      <header className="fullscreen-topbar">
        <button
          type="button"
          className="topbar-back"
          onClick={() => {
            if (phase === "pratique") {
              returnToLessonPhase();
              return;
            }

            navigate(`/apprendre/${numericCourseId}`);
          }}
          aria-label="Retour au parcours"
        >
          x
        </button>
        <div className="topbar-center">
          {`${breadcrumbLanguage} > Unite ${unit.index} > Lecon ${lessonNumber}`}
        </div>
        <div className="topbar-right">{phase === "pratique" ? "Pratique" : "Lecon"}</div>
      </header>

      <div className="lesson-layout" style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <div
          className="lesson-content-pane"
          style={{ minHeight: 0 }}
        >
          {phase === "lesson" ? (
            <div className="lesson-content-inner">
              <span className="badge badge-teal">{`Unite ${unit.index}`}</span>
              <p className="lesson-kicker">{`LECON ${lessonNumber} / ${lessonCount}`}</p>
              <h1 className="lesson-title">{currentLesson.title}</h1>
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    blockquote: ({ children }) => <div className="lesson-note">{children}</div>,
                    code({ children, className }) {
                      const content = String(children).replace(/\n$/, "");
                      if (Boolean(className) || content.includes("\n")) {
                        return (
                          <div style={{ position: "relative" }}>
                            <button
                              type="button"
                              style={{
                                position: "absolute",
                                top: 8,
                                right: 10,
                                fontSize: 11,
                                fontWeight: 700,
                                fontFamily: "var(--mono)",
                                color: "var(--teal)",
                                background: "var(--teal-soft)",
                                border: "1px solid var(--teal-ring)",
                                borderRadius: "var(--r-sm)",
                                padding: "3px 9px",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() => {
                                loadCodeBlockIntoEditor(content, className);
                              }}
                            >
                              ↗ Essayer
                            </button>
                            <pre className="lesson-code-block">
                              <code>{content}</code>
                            </pre>
                          </div>
                        );
                      }

                      return <code className="inline-code">{children}</code>;
                    },
                  }}
                >
                  {currentLesson.content || "Le contenu detaille de cette lecon n'est pas encore disponible."}
                </ReactMarkdown>
              </div>

              {lessonExpectedNote ? (
                <div className="lesson-note">
                  <strong>{isWebLesson ? "Repère visuel :" : "Sortie attendue :"}</strong> {lessonExpectedNote}
                </div>
              ) : null}

              <div className="lesson-action-row">
                <button type="button" className="btn btn-primary" onClick={enterPracticePhase}>
                  Passer à la pratique
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(exercisePath)}>
                  Aller aux exercices
                </button>
              </div>
            </div>
          ) : (
            <PratiqueInline
              key={`${numericCourseId}-${currentLesson.id}`}
              lessonId={currentLesson.id}
              courseId={numericCourseId}
              consoleOutput={consoleOutput}
              challenge={practiceChallenge}
              runAssessment={practiceRunAssessment}
              hasRunCode={hasRunCode}
              isRunning={isRunning}
              isWebLesson={isWebLesson}
              onAiOpen={() => setAiOpen(true)}
              onValidate={() => undefined}
              onBack={returnToLessonPhase}
            />
          )}
        </div>

        <div
          className="lesson-workspace-pane"
          style={{ minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <div className="workspace-toolbar">
            <div className="editor-tabs">
              {isWebLesson ? (
                (["html", "css", "js"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`editor-tab${activeTab === tab ? " active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))
              ) : (
                <button type="button" className="editor-tab active">
                  {displayLanguageLabel(canonicalLanguage)}
                </button>
              )}
            </div>

            <div className="workspace-toolbar-actions">
              <button type="button" className="btn btn-primary" onClick={() => void handleRunCode()}>
                {isRunning ? "Exécution..." : "Exécuter"}
              </button>
              <span
                style={{
                  color: "var(--text-3)",
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  lineHeight: 1,
                }}
              >
                Ctrl+Enter
              </span>
              <button type="button" className="btn btn-ghost" onClick={handleResetCode}>
                Reinitialiser
              </button>
            </div>
          </div>

          <div
            className="workspace-main"
            style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div
              className="editor-panel"
              style={{ flex: `${100 - previewRatio} 1 0%`, minHeight: 0, overflow: "hidden" }}
            >
              <CodeEditor
                value={codeEditorValue}
                onChange={handleEditorChange}
                language={codeEditorLanguage}
                editorCode={editorCode}
                setEditorCode={setEditorCode}
              />
            </div>

            <div
              className="preview-resizer"
              onMouseDown={(event) => {
                resizeRef.current = {
                  startY: event.clientY,
                  startRatio: previewRatio,
                };
              }}
            >
              <span />
            </div>

            <div
              className="preview-panel"
              style={{ flex: `${previewRatio} 1 0%`, minHeight: 180, overflowY: "auto" }}
            >
              <div className="preview-header">
                <div className="preview-header-copy">
                  <span className="preview-label">{isWebLesson ? "Apercu" : "Console"}</span>
                  <span className="preview-subcopy">
                    {isWebLesson
                      ? "Zone de rendu visuel du defi"
                      : "Sortie de ton programme apres execution"}
                  </span>
                </div>
                {practiceRunAssessment ? (
                  <span className={`preview-feedback-pill ${practiceRunAssessment.kind}`}>
                    {getPracticeRunAssessmentLabel(practiceRunAssessment)}
                  </span>
                ) : null}
              </div>

              {practiceRunAssessment ? (
                <div className={`practice-run-feedback practice-run-feedback-${practiceRunAssessment.kind}`}>
                  <strong>{practiceRunAssessment.title}</strong>
                  <span>{practiceRunAssessment.message}</span>
                </div>
              ) : null}

              {isWebLesson ? (
                hasRunCode ? (
                  <iframe title="Apercu de la lecon" className="preview-iframe" srcDoc={previewDoc} />
                ) : (
                  <div className="console-output preview-placeholder">{consoleDisplayText}</div>
                )
              ) : (
                <pre className="console-output">{consoleDisplayText}</pre>
              )}
            </div>
          </div>

          <div className="workspace-nav">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!previousLesson}
              onClick={() => {
                if (!previousLesson) {
                  return;
                }

                startTransition(() => {
                  setPhase("lesson");
                  setCurrentLessonId(previousLesson.id);
                  setConsoleText("");
                  setConsoleOutput("");
                  setLastRunFeedback(null);
                  setPreviewDoc("");
                  setHasRunCode(false);
                });
              }}
            >
              Lecon precedente
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!nextLesson}
              onClick={() => void handleNextLesson()}
            >
              Lecon suivante
            </button>
          </div>
        </div>
      </div>

      <AiAssistant
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        mode="pratique"
        contextKey={`practice-${numericCourseId}-${unit.id}-${currentLesson.id}`}
        language={canonicalLanguage}
        lessonTitle={currentLesson.title}
        instructions={practiceChallenge.instructions}
        objective={practiceChallenge.objective}
        expectedOutput={practiceChallenge.expectedOutput}
        currentCode={practiceCodeSnapshot}
        consoleOutput={lastRunFeedback?.stdout ?? ""}
        currentError={currentRunError}
      />
    </div>
  );
}

function LoadingLessonState() {
  return (
    <div className="fullscreen-page">
      <header className="fullscreen-topbar">
        <span className="topbar-back">x</span>
        <div className="topbar-center">Chargement de la lecon...</div>
        <div className="topbar-right">Lecon</div>
      </header>
      <div className="page" style={{ paddingTop: 24 }}>
        <div className="card content-section">
          <p className="text-muted">
            Nous preparons le contenu, l'editeur et l'apercu de cette unite.
          </p>
        </div>
      </div>
    </div>
  );
}

function InvalidUnitState({ onBack }: { onBack: () => void }) {
  return (
    <div className="fullscreen-page">
      <div className="page" style={{ paddingTop: 24 }}>
        <div className="card content-section page-stack">
          <p className="section-kicker">Unite introuvable</p>
          <h1 className="section-title">Impossible d'ouvrir cette lecon</h1>
          <p className="text-muted">
            Verifie le parcours demande ou retourne a la carte du cours.
          </p>
          <button type="button" className="btn btn-primary" onClick={onBack}>
            Revenir au parcours
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeLanguage(value: string | null | undefined) {
  const normalized = normalizeOptionalLanguage(value);
  if (!normalized) {
    return "java";
  }

  return normalized;
}

function normalizeOptionalLanguage(value: string | null | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) {
    return "";
  }

  if (normalized === "js") {
    return "javascript";
  }

  if (normalized === "c++") {
    return "cpp";
  }

  if (normalized === "c#") {
    return "csharp";
  }

  if (normalized === "mysql") {
    return "sql";
  }

  return normalized;
}

function mapLanguageToTab(language: string): WebTab {
  return language === "css" ? "css" : language === "javascript" ? "js" : "html";
}

function buildInitialWebPlayground(lesson: LessonDetail, language: string): WebPlaygroundState {
  return buildInitialWebPlaygroundFromStarter(resolveLessonStarterCode(lesson, language), language);
}

function buildInitialWebPlaygroundFromStarter(starterCode: string, language: string): WebPlaygroundState {
  const starter = starterCode.trim();
  const base = {
    html: "<section><h1>Previsualisation</h1><p>Ton rendu apparaitra ici apres execution.</p></section>",
    css: "body { font-family: 'Manrope', sans-serif; padding: 24px; color: #141b2d; }",
    js: "",
  };
  if (!starter) return base;
  if (/<!doctype html|<html/i.test(starter)) {
    return {
      html: extractTagContent(starter, "body") || base.html,
      css: extractTagContent(starter, "style") || "",
      js: extractTagContent(starter, "script") || "",
    };
  }
  if (language === "css") return { ...base, css: starter };
  if (language === "javascript") return { ...base, js: starter };
  return { ...base, html: starter };
}

function buildWebDocument(playground: WebPlaygroundState) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${escapeClosingTag(playground.css, "style")}</style>
  </head>
  <body>
    ${playground.html}
    <script>${escapeClosingTag(playground.js, "script")}</script>
  </body>
</html>`;
}

function extractTagContent(source: string, tagName: "body" | "style" | "script") {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i");
  const match = source.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function escapeClosingTag(value: string, tagName: "style" | "script") {
  return value.replace(new RegExp(`</${tagName}>`, "gi"), `<\\/${tagName}>`);
}

function defaultStarterForLanguage(language: string) {
  switch (language) {
    case "python":
      return 'print("Bonjour UniCode Academy")';
    case "c":
      return "#include <stdio.h>\n\nint main(void) {\n  printf(\"Bonjour UniCode Academy\\n\");\n  return 0;\n}";
    case "cpp":
      return "#include <iostream>\n\nint main() {\n  std::cout << \"Bonjour UniCode Academy\" << std::endl;\n  return 0;\n}";
    case "csharp":
      return "using System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine(\"Bonjour UniCode Academy\");\n  }\n}";
    case "sql":
      return "SELECT 'Bonjour UniCode Academy';";
    case "html":
      return "<section><h1>Bonjour UniCode</h1><p>Teste ton interface ici.</p></section>";
    case "css":
      return "body { font-family: 'Manrope', sans-serif; padding: 24px; color: #141b2d; }";
    case "javascript":
      return "console.log('UniCode Academy');";
    case "java":
    default:
      return "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Bonjour UniCode Academy\");\n  }\n}";
  }
}

function resolveEditorLanguage(
  isWebLesson: boolean,
  activeTab: WebTab,
  canonicalLanguage: string
) {
  return isWebLesson ? activeTab : canonicalLanguage === "python" ? "python" : "java";
}

function displayLanguageLabel(language: string) {
  switch (language) {
    case "python":
      return "PYTHON";
    case "c":
      return "C";
    case "cpp":
      return "C++";
    case "csharp":
      return "C#";
    case "sql":
      return "SQL";
    case "javascript":
      return "JAVASCRIPT";
    case "css":
      return "CSS";
    case "html":
      return "HTML";
    case "java":
    default:
      return "JAVA";
  }
}

function formatConsoleOutput(stdout: string, stderr: string, compileOutput: string) {
  const lines = [compileOutput, stdout, stderr]
    .filter((part) => part.trim().length > 0)
    .flatMap((part) => part.trim().split(/\r?\n/))
    .map((line) => `> ${line}`);

  if (lines.length === 0) {
    return "";
  }

  return lines.join("\n");
}

function formatAiPracticeCodeSnapshot(playground: WebPlaygroundState) {
  return `HTML:\n${playground.html}\n\nCSS:\n${playground.css}\n\nJS:\n${playground.js}`;
}

function resolveSnippetLanguage(
  className: string | undefined,
  fallbackLanguage: string
): EditorSnippetLanguage {
  const normalizedClass = normalizeOptionalLanguage((className ?? "").replace(/^language-/, ""));
  if (normalizedClass) {
    return resolveEditorModeForLanguage(normalizedClass);
  }

  return resolveEditorModeForLanguage(fallbackLanguage);
}

function resolvePracticeChallenge({
  lesson,
  language,
}: {
  lesson: LessonDetail;
  language: string;
}): PracticeChallengeView {
  const validationMode = WEB_LANGUAGES.has(language) ? "preview" : "stdout";
  const lessonChallenge = extractPracticeChallengeFields(lesson, {
    allowGenericStarterCode: false,
  });
  const exerciseForFallback = resolveExerciseFallback(lesson.exercises ?? []);
  const exerciseChallenge = exerciseForFallback
    ? extractPracticeChallengeFields(exerciseForFallback, {
        allowGenericStarterCode: false,
      })
    : {};
  const parsedExercise = exerciseForFallback
    ? parseExercisePrompt(exerciseForFallback.question)
    : { text: "", code: "" };
  const objective = firstNonEmpty(
    lessonChallenge.objective,
    exerciseChallenge.objective,
    extractLessonObjective(lesson.content),
    parsedExercise.text,
    defaultPracticeObjective(language, validationMode)
  );
  const instructions = resolvePracticeInstructions({
    explicitInstructions: firstNonEmpty(
      lessonChallenge.instructions,
      exerciseChallenge.instructions
    ),
    objective,
    language,
    validationMode,
  });
  const starterCode = resolveMeaningfulStarterCode({
    language,
    lessonChallengeStarterCode: lessonChallenge.starterCode,
    exerciseChallengeStarterCode: exerciseChallenge.starterCode,
  });
  const explicitExpectedOutput = resolveMeaningfulExpectedOutput({
    language,
    lessonTitle: lesson.title,
    instructions: `${objective} ${instructions}`.trim(),
    starterCode,
    lessonExpectedOutput: lessonChallenge.expectedOutput,
    exerciseExpectedOutput: exerciseChallenge.expectedOutput,
    sampleOutput: sanitizeValue(lesson.sampleOutput),
  });
  const exactExpectedOutput = firstNonEmpty(explicitExpectedOutput);
  const expectedOutputDisplay = exactExpectedOutput
    ? exactExpectedOutput
    : buildExpectedOutputGuidance({
        objective,
        instructions,
        language,
        validationMode,
      });

  return {
    title: firstNonEmpty(
      lessonChallenge.title,
      exerciseChallenge.title,
      lesson.title,
      "Defi pratique"
    ),
    objective,
    instructions,
    expectedOutput: exactExpectedOutput,
    expectedOutputDisplay,
    expectedOutputKind: exactExpectedOutput ? "exact" : "guidance",
    hint: firstNonEmpty(
      lessonChallenge.hint,
      exerciseChallenge.hint,
      exerciseForFallback?.explanation ?? "",
      defaultPracticeHint(language, validationMode)
    ),
    starterCode,
    validationMode,
    expectedOutputPending: false,
  };
}

function extractPracticeChallengeFields(
  source: unknown,
  options?: { allowGenericStarterCode?: boolean }
): PracticeChallengeFields {
  if (!source || typeof source !== "object") {
    return {};
  }

  const allowGenericStarterCode = options?.allowGenericStarterCode ?? true;
  const record = source as Record<string, unknown>;
  const nested = extractNestedPracticeChallenge(record);

  return {
    title: firstNonEmpty(
      nested.title,
      readTextField(record, ["practiceTitle", "pratiqueTitle", "challengeTitle", "title"])
    ),
    objective: firstNonEmpty(
      nested.objective,
      readTextField(record, [
        "practiceObjective",
        "pratiqueObjective",
        "challengeObjective",
        "objective",
        "goal",
        "target",
      ])
    ),
    instructions: firstNonEmpty(
      nested.instructions,
      readTextField(record, [
        "practiceInstructions",
        "pratiqueInstructions",
        "challengeInstructions",
        "instructions",
        "prompt",
        "question",
      ])
    ),
    expectedOutput: firstNonEmpty(
      nested.expectedOutput,
      readTextField(record, [
        "practiceExpectedOutput",
        "challengeExpectedOutput",
        "expectedOutput",
        "expected_output",
        "sampleOutput",
        "sample_output",
      ])
    ),
    hint: firstNonEmpty(
      nested.hint,
      readTextField(record, [
        "practiceHint",
        "pratiqueHint",
        "challengeHint",
        "hint",
        "explanation",
      ])
    ),
    starterCode: firstNonEmpty(
      nested.starterCode,
      readTextField(record, [
        "practiceStarterCode",
        "challengeStarterCode",
        "template",
        "codeTemplate",
        ...(allowGenericStarterCode ? ["starterCode", "starter_code"] : []),
      ])
    ),
  };
}

function resolveExerciseFallback(exercises: LessonExercise[]) {
  if (exercises.length === 0) {
    return null;
  }

  return (
    exercises.find((exercise) => exercise.type.toUpperCase() === "CODE") ??
    exercises.find((exercise) => hasPracticeChallengeData(exercise)) ??
    exercises[0]
  );
}

function hasPracticeChallengeData(source: unknown) {
  const fields = extractPracticeChallengeFields(source);
  return Boolean(
    fields.instructions ||
      fields.expectedOutput ||
      fields.hint ||
      fields.starterCode
  );
}

function extractNestedPracticeChallenge(record: Record<string, unknown>): PracticeChallengeFields {
  const nestedKeys = [
    "practiceChallenge",
    "pratiqueChallenge",
    "codingChallenge",
    "challenge",
    "practice",
    "pratique",
  ];

  for (const key of nestedKeys) {
    const nestedValue = record[key];
    if (!nestedValue || typeof nestedValue !== "object") {
      continue;
    }

    const nestedRecord = nestedValue as Record<string, unknown>;
    return {
      title: readTextField(nestedRecord, ["title", "practiceTitle", "challengeTitle"]),
      objective: readTextField(nestedRecord, [
        "objective",
        "goal",
        "target",
        "practiceObjective",
        "challengeObjective",
      ]),
      instructions: readTextField(nestedRecord, [
        "instructions",
        "description",
        "prompt",
      ]),
      expectedOutput: readTextField(nestedRecord, [
        "expectedOutput",
        "expected_output",
        "sampleOutput",
        "sample_output",
      ]),
      hint: readTextField(nestedRecord, ["hint", "explanation"]),
      starterCode: readTextField(nestedRecord, [
        "starterCode",
        "starter_code",
        "template",
        "codeTemplate",
      ]),
    };
  }

  return {};
}

function readTextField(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function extractLessonObjective(content: string | null | undefined) {
  if (!content) {
    return "";
  }

  const normalized = content.replace(/\r\n/g, "\n");
  const objectifMatch = normalized.match(/##\s*Objectif\s*\n+([\s\S]*?)(?:\n##\s|\n#\s|$)/i);
  if (objectifMatch?.[1]) {
    return compactText(stripMarkdown(objectifMatch[1]));
  }

  const firstParagraph = normalized.split(/\n{2,}/).find((block) => block.trim());
  return compactText(stripMarkdown(firstParagraph ?? ""));
}

function parseExercisePrompt(question: string) {
  const match = question.match(/```[\w+-]*\n([\s\S]*?)```/);
  if (!match) {
    return {
      text: compactText(stripMarkdown(question)),
      code: "",
    };
  }

  return {
    text: compactText(stripMarkdown(question.replace(match[0], ""))),
    code: match[1].trim(),
  };
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeValue(value: string | null | undefined) {
  return (value ?? "").trim();
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function defaultPracticeObjective(language: string, validationMode: "stdout" | "preview") {
  if (validationMode === "preview") {
    return "Modifie l'interface pour obtenir le rendu demande.";
  }

  switch (language) {
    case "python":
      return "Produis le comportement demande en Python.";
    case "java":
      return "Produis le comportement demande en Java.";
    case "c":
    case "cpp":
    case "csharp":
    case "sql":
      return "Adapte le code pour obtenir le comportement demande.";
    default:
      return "Modifie le code pour atteindre l'objectif du defi.";
  }
}

function resolvePracticeInstructions({
  explicitInstructions,
  objective,
  language,
  validationMode,
}: {
  explicitInstructions: string;
  objective: string;
  language: string;
  validationMode: "stdout" | "preview";
}) {
  if (explicitInstructions && compactText(explicitInstructions) !== compactText(objective)) {
    return explicitInstructions;
  }

  if (validationMode === "preview") {
    return "Modifie le code de depart a droite, clique sur Executer, puis verifie le rendu avant de valider ou de continuer.";
  }

  switch (language) {
    case "python":
      return "Complete le code de depart, execute-le, puis compare le resultat affiche avec le comportement attendu.";
    case "java":
      return "Complete le programme Java, execute-le, puis verifie la console avant de valider.";
    case "c":
    case "cpp":
    case "csharp":
    case "sql":
      return "Adapte le code de depart, execute-le, puis verifie la console ligne par ligne avant de continuer.";
    default:
      return "Modifie le code de depart, execute-le, puis verifie le resultat avant de valider.";
  }
}

function defaultPracticeHint(language: string, validationMode: "stdout" | "preview") {
  if (validationMode === "preview") {
    return "Appuie sur Exécuter pour recharger l'aperçu et vérifie les détails visuels avant de valider.";
  }

  switch (language) {
    case "python":
      return "Relis les instructions et vérifie chaque ligne affichée avec print().";
    case "java":
      return "Pense à utiliser System.out.println pour chaque ligne attendue.";
    case "c":
    case "cpp":
      return "Compare soigneusement les espaces, les retours à la ligne et le texte affiché.";
    case "csharp":
      return "Utilise Console.WriteLine pour obtenir une sortie claire et ligne par ligne.";
    case "sql":
      return "Le résultat attendu dépend uniquement des lignes affichées par ta requête finale.";
    default:
      return "Lance ton code, observe la console puis ajuste jusqu'à obtenir exactement la sortie attendue.";
  }
}

function buildExpectedOutputGuidance({
  objective,
  instructions,
  language,
  validationMode,
}: {
  objective: string;
  instructions: string;
  language: string;
  validationMode: "stdout" | "preview";
}) {
  if (validationMode === "preview") {
    return "Aucun rendu exact cache n'est fourni. Utilise l'objectif du defi et verifie visuellement le resultat dans l'apercu.";
  }

  const context = `${objective} ${instructions}`.toLowerCase();
  if (/affich|print|println|console|sortie/.test(context)) {
    return "Aucune sortie exacte cachee n'est fournie. Execute ton code puis verifie surtout que le texte affiche suit bien l'objectif du defi.";
  }

  if (language === "sql") {
    return "Aucun resultat exact cache n'est fourni. Execute la requete puis verifie les colonnes, le filtrage et l'ordre des lignes obtenues.";
  }

  return "Aucune sortie exacte cachee n'est fournie. Execute ton code puis verifie surtout le comportement demande avant de continuer.";
}

function resolveLessonStarterCode(lesson: LessonDetail, language: string) {
  const lessonStarterCode = sanitizeValue(lesson.starterCode);
  const contentStarterCode = extractPracticeStarterFromContent(lesson.content, language);

  if (contentStarterCode && looksLikeGenericStarterCode(lessonStarterCode, language)) {
    return contentStarterCode;
  }

  return firstNonEmpty(lessonStarterCode, contentStarterCode, defaultStarterForLanguage(language));
}

function resolveMeaningfulStarterCode({
  language,
  lessonChallengeStarterCode,
  exerciseChallengeStarterCode,
}: {
  language: string;
  lessonChallengeStarterCode?: string;
  exerciseChallengeStarterCode?: string;
}) {
  const explicitStarterCode = firstNonEmpty(
    lessonChallengeStarterCode,
    exerciseChallengeStarterCode
  );

  if (explicitStarterCode) {
    return explicitStarterCode;
  }

  return defaultPracticeStarterForLanguage(language);
}

function defaultPracticeStarterForLanguage(language: string) {
  switch (language) {
    case "python":
      return "# Ecris ton code ici";
    case "c":
      return "#include <stdio.h>\n\nint main(void) {\n  // Ecris ton code ici\n  return 0;\n}";
    case "cpp":
      return "#include <iostream>\n\nint main() {\n  // Ecris ton code ici\n  return 0;\n}";
    case "csharp":
      return "using System;\n\nclass Program {\n  static void Main() {\n    // Ecris ton code ici\n  }\n}";
    case "sql":
      return "-- Ecris ta requete ici";
    case "html":
      return "<section>\n  <h1>A toi de jouer</h1>\n  <p>Modifie ce rendu pour repondre au defi.</p>\n</section>";
    case "css":
      return "body {\n  font-family: 'Manrope', sans-serif;\n  color: #141b2d;\n}\n\n/* Modifie le style ici */";
    case "javascript":
      return "// Ecris ton code ici";
    case "java":
    default:
      return "public class Main {\n  public static void main(String[] args) {\n    // Ecris ton code ici\n  }\n}";
  }
}

function resolveMeaningfulExpectedOutput({
  language,
  lessonTitle,
  instructions,
  starterCode,
  lessonExpectedOutput,
  exerciseExpectedOutput,
  sampleOutput,
}: {
  language: string;
  lessonTitle: string;
  instructions: string;
  starterCode: string;
  lessonExpectedOutput?: string;
  exerciseExpectedOutput?: string;
  sampleOutput?: string;
}) {
  const candidates = [lessonExpectedOutput, exerciseExpectedOutput, sampleOutput];

  for (const candidate of candidates) {
    const normalizedCandidate = sanitizeValue(candidate);
    if (!normalizedCandidate) {
      continue;
    }

    if (
      shouldSuppressExpectedOutput({
        expectedOutput: normalizedCandidate,
        language,
        lessonTitle,
        instructions,
        starterCode,
      })
    ) {
      continue;
    }

    return normalizedCandidate;
  }

  return "";
}

function shouldSuppressExpectedOutput({
  expectedOutput,
  language,
  lessonTitle,
  instructions,
  starterCode,
}: {
  expectedOutput: string;
  language: string;
  lessonTitle: string;
  instructions: string;
  starterCode: string;
}) {
  if (!looksLikeGenericExpectedOutput(expectedOutput, language)) {
    return false;
  }

  const context = `${lessonTitle} ${instructions}`.toLowerCase();
  if (/bonjour|hello|premier|introduction|welcome|bienvenue/.test(context)) {
    return false;
  }

  if (isBehaviorFocusedLessonContext(context)) {
    return true;
  }

  return looksLikeGenericStarterCode(starterCode, language);
}

function looksLikeGenericStarterCode(value: string, language: string) {
  const normalized = normalizePlaceholderText(value);
  if (!normalized) {
    return false;
  }

  if (
    normalized.includes("unicode academy") ||
    normalized.includes("bonjour unicode") ||
    normalized.includes("unicode practice") ||
    normalized.includes("hello from") ||
    normalized.includes("teste ton interface ici") ||
    normalized.includes("edit css and click run") ||
    normalized.includes("edit javascript and click run")
  ) {
    return true;
  }

  switch (language) {
    case "python":
      return normalized.includes("bonjour unicode academy") || normalized.includes("hello, python");
    case "java":
      return normalized.includes("bonjour unicode academy") || normalized.includes("hello, java");
    case "c":
      return normalized.includes("hello, c");
    case "cpp":
      return normalized.includes("hello, c++");
    case "csharp":
      return normalized.includes("hello, c#");
    case "sql":
      return normalized.includes("hello, sql");
    case "javascript":
      return normalized.includes("unicode academy") || normalized.includes("hello, javascript");
    case "html":
      return normalized.includes("bonjour unicode") || normalized.includes("preview") || normalized.includes("previsualisation");
    case "css":
      return normalized.includes("font-family") && normalized.includes("padding: 24px");
    default:
      return false;
  }
}

function looksLikeGenericExpectedOutput(value: string, language: string) {
  const normalized = normalizePlaceholderText(value);
  if (!normalized) {
    return false;
  }

  if (
    normalized.includes("unicode academy") ||
    normalized.includes("bonjour unicode") ||
    normalized.includes("hello from") ||
    normalized.includes("style applique")
  ) {
    return true;
  }

  switch (language) {
    case "python":
      return normalized.includes("hello, python") || normalized.includes("bonjour unicode academy");
    case "java":
      return normalized.includes("hello, java") || normalized.includes("bonjour unicode academy");
    case "c":
      return normalized.includes("hello, c");
    case "cpp":
      return normalized.includes("hello, c++");
    case "csharp":
      return normalized.includes("hello, c#");
    case "sql":
      return normalized.includes("hello, sql");
    case "javascript":
      return normalized.includes("hello, javascript") || normalized.includes("unicode academy");
    case "html":
      return normalized.includes("bonjour unicode") || normalized.includes("previsualisation");
    case "css":
      return normalized.includes("style applique");
    default:
      return false;
  }
}

function normalizePlaceholderText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function isBehaviorFocusedLessonContext(context: string) {
  return /operat|egalit|compar|condition|boucle|loop|fonction|method|variable|string|chaine|tableau|array|list|dom|event|selecteur|flex|grid|requete|join|where|group by|class|objet|exception/.test(
    context
  );
}

function extractPracticeStarterFromContent(
  content: string | null | undefined,
  language: string
) {
  const blocks = parseMarkdownCodeBlocks(content);
  if (blocks.length === 0) {
    return "";
  }

  const normalizedLanguage = normalizeLanguage(language);
  const bestBlock =
    [...blocks]
      .map((block) => ({
        block,
        score: scorePracticeCodeBlock(block, normalizedLanguage),
      }))
      .sort((left, right) => right.score - left.score)[0]?.block ?? null;

  if (!bestBlock) {
    return "";
  }

  return adaptSnippetForPractice(bestBlock.code, normalizedLanguage);
}

function parseMarkdownCodeBlocks(content: string | null | undefined) {
  if (!content) {
    return [] as Array<{ language: string; code: string }>;
  }

  const blocks: Array<{ language: string; code: string }> = [];
  const pattern = /```([\w#+-]*)\n([\s\S]*?)```/g;

  for (const match of content.matchAll(pattern)) {
    const code = (match[2] ?? "").trim();
    if (!code) {
      continue;
    }

    blocks.push({
      language: normalizeOptionalLanguage(match[1] ?? ""),
      code,
    });
  }

  return blocks;
}

function scorePracticeCodeBlock(
  block: { language: string; code: string },
  language: string
) {
  let score = 0;
  if (block.language === language) {
    score += 40;
  } else if (!block.language) {
    score += 10;
  }

  if (looksRunnableForLanguage(block.code, language)) {
    score += 25;
  }

  if (block.code.length < 700) {
    score += 5;
  }

  return score;
}

function looksRunnableForLanguage(code: string, language: string) {
  const normalized = code.toLowerCase();

  switch (language) {
    case "python":
      return /print\(|input\(/.test(normalized);
    case "c":
      return /printf\(|main\s*\(/.test(normalized);
    case "cpp":
      return /cout|main\s*\(/.test(normalized);
    case "java":
      return /system\.out|main\s*\(/.test(normalized);
    case "csharp":
      return /console\.write|main\s*\(/.test(normalized);
    case "sql":
      return /\bselect\b|\bcreate\b|\binsert\b|\bupdate\b|\bdelete\b/.test(normalized);
    case "html":
      return /<\w+/.test(normalized);
    case "css":
      return /[.#a-z0-9_-]+\s*\{/.test(normalized);
    case "javascript":
      return /console\.log|document\.|addEventListener|fetch\(/.test(normalized);
    default:
      return false;
  }
}

function adaptSnippetForPractice(snippet: string, language: string) {
  const trimmed = snippet.trim();
  if (!trimmed) {
    return "";
  }

  switch (language) {
    case "c":
      return wrapCLikeSnippet(trimmed, "c");
    case "cpp":
      return wrapCLikeSnippet(trimmed, "cpp");
    case "java":
      return wrapJavaSnippet(trimmed);
    case "csharp":
      return wrapCSharpSnippet(trimmed);
    default:
      return trimmed;
  }
}

function wrapCLikeSnippet(snippet: string, language: "c" | "cpp") {
  if (/\bmain\s*\(/.test(snippet)) {
    return snippet;
  }

  const lines = snippet.split(/\r?\n/);
  const prelude: string[] = [];
  const body: string[] = [];

  lines.forEach((line) => {
    if (/^\s*#include\b/.test(line) || /^\s*using namespace\b/.test(line)) {
      prelude.push(line);
      return;
    }

    body.push(line);
  });

  const { definitions, statements } = splitTopLevelBlocks(body.join("\n"), language);
  const includes =
    prelude.length > 0
      ? prelude
      : [language === "cpp" ? "#include <iostream>" : "#include <stdio.h>"];
  const needsUsingNamespace =
    language === "cpp" &&
    !includes.some((line) => /using namespace std;/.test(line)) &&
    /\bcout\b/.test(snippet) &&
    !/\bstd::cout\b/.test(snippet);
  const statementBody = statements.length > 0 ? statements.join("\n\n") : "// Complete ici";

  return [
    ...includes,
    ...(needsUsingNamespace ? ["using namespace std;"] : []),
    "",
    ...definitions,
    ...(definitions.length > 0 ? [""] : []),
    language === "cpp" ? "int main() {" : "int main(void) {",
    indentBlock(statementBody, 2),
    "  return 0;",
    "}",
  ]
    .filter(Boolean)
    .join("\n");
}

function wrapJavaSnippet(snippet: string) {
  if (/\bclass\s+\w+/.test(snippet) && /\bmain\s*\(/.test(snippet)) {
    return snippet;
  }

  const lines = snippet.split(/\r?\n/);
  const imports = lines.filter((line) => /^\s*import\s+/.test(line));
  const body = lines.filter((line) => !/^\s*import\s+/.test(line)).join("\n");
  const { definitions, statements } = splitTopLevelBlocks(body, "java");
  const externalDefinitions = definitions.filter((block) => /^\s*(class|interface|enum|record)\b/.test(block));
  const memberDefinitions = definitions.filter((block) => !externalDefinitions.includes(block));
  const mainBody = statements.length > 0 ? statements.join("\n\n") : "System.out.println(\"Complete ici\");";

  return [
    ...imports,
    ...(imports.length > 0 ? [""] : []),
    ...externalDefinitions,
    ...(externalDefinitions.length > 0 ? [""] : []),
    "public class Main {",
    ...(memberDefinitions.length > 0 ? [indentBlock(memberDefinitions.join("\n\n"), 2), ""] : []),
    "  public static void main(String[] args) {",
    indentBlock(mainBody, 4),
    "  }",
    "}",
  ]
    .filter(Boolean)
    .join("\n");
}

function wrapCSharpSnippet(snippet: string) {
  if (/\bclass\s+\w+/.test(snippet) && /\bMain\s*\(/.test(snippet)) {
    return snippet;
  }

  const lines = snippet.split(/\r?\n/);
  const usings = lines.filter((line) => /^\s*using\s+/.test(line));
  const body = lines.filter((line) => !/^\s*using\s+/.test(line)).join("\n");
  const { definitions, statements } = splitTopLevelBlocks(body, "csharp");
  const externalDefinitions = definitions.filter((block) => /^\s*(class|struct|interface|enum)\b/.test(block));
  const memberDefinitions = definitions.filter((block) => !externalDefinitions.includes(block));
  const mainBody = statements.length > 0 ? statements.join("\n\n") : "Console.WriteLine(\"Complete ici\");";

  return [
    ...(usings.length > 0 ? usings : ["using System;"]),
    "",
    ...externalDefinitions,
    ...(externalDefinitions.length > 0 ? [""] : []),
    "class Program {",
    ...(memberDefinitions.length > 0 ? [indentBlock(memberDefinitions.join("\n\n"), 2), ""] : []),
    "  static void Main() {",
    indentBlock(mainBody, 4),
    "  }",
    "}",
  ]
    .filter(Boolean)
    .join("\n");
}

function splitTopLevelBlocks(snippet: string, language: string) {
  const definitions: string[] = [];
  const statements: string[] = [];
  const lines = snippet.split(/\r?\n/);
  let buffer: string[] = [];
  let depth = 0;

  const flush = () => {
    const block = buffer.join("\n").trim();
    buffer = [];
    if (!block) {
      return;
    }

    if (looksLikeTopLevelDefinition(block, language)) {
      definitions.push(block);
      return;
    }

    statements.push(block);
  };

  lines.forEach((line) => {
    buffer.push(line);
    depth += (line.match(/\{/g) ?? []).length;
    depth -= (line.match(/\}/g) ?? []).length;

    if (depth === 0) {
      flush();
    }
  });

  if (buffer.length > 0) {
    flush();
  }

  return { definitions, statements };
}

function looksLikeTopLevelDefinition(block: string, language: string) {
  const trimmed = block.trim();

  if (/^(class|struct|interface|enum|record)\b/.test(trimmed)) {
    return true;
  }

  if (/^\s*(public|private|protected|internal|static|sealed|abstract)\b[\s\S]*\{/.test(trimmed)) {
    return true;
  }

  if (language === "c" || language === "cpp") {
    return /^[A-Za-z_][\w\s:*<>,&[\]]*\([^;]*\)\s*\{/.test(trimmed);
  }

  return /[A-Za-z_][\w<>\s,[\]]*\([^;]*\)\s*\{/.test(trimmed);
}

function indentBlock(value: string, spaces: number) {
  const padding = " ".repeat(spaces);
  return value
    .split(/\r?\n/)
    .map((line) => (line ? `${padding}${line}` : ""))
    .join("\n");
}

function resolveEditorModeForLanguage(language: string): EditorSnippetLanguage {
  switch (normalizeLanguage(language)) {
    case "html":
      return "html";
    case "css":
      return "css";
    case "javascript":
      return "js";
    case "python":
      return "python";
    default:
      return "java";
  }
}

function evaluatePracticeRunAssessment({
  challenge,
  hasRunCode,
  isRunning,
  isWebLesson,
  consoleOutput,
  currentError,
}: {
  challenge: PracticeChallengeView | null;
  hasRunCode: boolean;
  isRunning: boolean;
  isWebLesson: boolean;
  consoleOutput: string;
  currentError: string;
}): PracticeRunAssessment | null {
  if (!challenge) {
    return null;
  }

  if (isRunning) {
    return null;
  }

  if (currentError.trim()) {
    return {
      kind: "error",
      title: "Execution a corriger",
      message: "Le code s'arrete encore sur une erreur. Corrige d'abord le premier message de la console, puis relance.",
      recommendExercises: false,
    };
  }

  if (!hasRunCode) {
    return null;
  }

  if (isWebLesson || challenge.validationMode === "preview") {
    return {
      kind: "guidance",
      title: "Apercu mis a jour",
      message:
        challenge.expectedOutputKind === "exact"
          ? "Compare maintenant le rendu affiche avec le repere attendu, puis valide si tout est conforme."
          : "Le rendu est affiche. Verifie visuellement le resultat, puis valide ou passe aux exercices.",
      recommendExercises: false,
    };
  }

  if (challenge.expectedOutputPending) {
    return {
      kind: "guidance",
      title: "Resultat a verifier",
      message:
        "La sortie de reference est encore en preparation. Utilise la console et l'objectif du defi pour verifier le comportement avant de continuer.",
      recommendExercises: false,
    };
  }

  const expectedOutput = normalizePracticeOutput(challenge.expectedOutput);
  const actualOutput = normalizePracticeOutput(consoleOutput);

  if (!expectedOutput || challenge.expectedOutputKind !== "exact") {
    return {
      kind: "guidance",
      title: "Resultat a verifier",
      message:
        "La sortie de reference n'est pas assez fiable pour confirmer automatiquement la reponse. Verifie le comportement, puis valide ou passe aux exercices.",
      recommendExercises: true,
    };
  }

  if (actualOutput === expectedOutput) {
    return {
      kind: "success",
      title: "Bravo, le resultat correspond a l'attendu.",
      message: "Tu peux maintenant valider le defi ou passer aux exercices.",
      actualOutput,
      expectedOutput,
      recommendExercises: true,
    };
  }

  if (isClosePracticeOutput(actualOutput, expectedOutput)) {
    return {
      kind: "close",
      title: "Le resultat est proche, mais il reste quelque chose a corriger.",
      message: "Compare la console ligne par ligne, puis relance apres une petite correction.",
      actualOutput,
      expectedOutput,
      recommendExercises: false,
    };
  }

  return {
    kind: "failure",
    title: "Le resultat ne correspond pas encore a l'attendu.",
    message: "Verifie l'objectif, corrige le code, puis relance. Si besoin, ouvre l'aide guidee pour obtenir un indice.",
    actualOutput,
    expectedOutput,
    recommendExercises: false,
  };
}

function normalizePracticeOutput(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

function isClosePracticeOutput(actualOutput: string, expectedOutput: string) {
  if (!actualOutput || !expectedOutput || actualOutput === expectedOutput) {
    return false;
  }

  if (actualOutput.includes(expectedOutput) || expectedOutput.includes(actualOutput)) {
    return true;
  }

  const sharedPrefixRatio =
    getSharedPrefixLength(actualOutput, expectedOutput) /
    Math.max(actualOutput.length, expectedOutput.length);

  return sharedPrefixRatio >= 0.6;
}

function getSharedPrefixLength(left: string, right: string) {
  const limit = Math.min(left.length, right.length);
  let index = 0;

  while (index < limit && left[index] === right[index]) {
    index += 1;
  }

  return index;
}

function getPracticeRunAssessmentLabel(assessment: PracticeRunAssessment) {
  switch (assessment.kind) {
    case "success":
      return "Correct";
    case "close":
      return "Presque";
    case "failure":
    case "error":
      return "A corriger";
    case "guidance":
    default:
      return "A verifier";
  }
}

function getConsoleDisplayText({
  hasRunCode,
  isRunning,
  phase,
  isWebLesson,
  consoleText,
}: {
  hasRunCode: boolean;
  isRunning: boolean;
  phase: "lesson" | "pratique";
  isWebLesson: boolean;
  consoleText: string;
}) {
  if (isRunning) {
    return "Execution en cours...";
  }

  if (consoleText.trim()) {
    return consoleText;
  }

  if (hasRunCode) {
    return consoleText || (isWebLesson ? "Apercu pret." : "Le programme ne produit pas encore de sortie.");
  }

  if (isWebLesson) {
    return phase === "pratique"
      ? "Execute ton code pour afficher l'apercu du defi ici."
      : "Execute ton code pour afficher ou recharger l'apercu ici.";
  }

  return phase === "pratique"
    ? "Execute ton code pour verifier le resultat du defi ici."
    : "Execute ton code pour voir le resultat ici.";
}

function formatRunError(runFeedback: RunFeedback | null) {
  if (!runFeedback) {
    return "";
  }

  return [runFeedback.compileOutput, runFeedback.stderr]
    .map((part) => sanitizeValue(part))
    .filter(Boolean)
    .join("\n");
}

function getLessonExpectedNote(challenge: PracticeChallengeView | null) {
  if (!challenge) {
    return "";
  }

  if (challenge.expectedOutputKind !== "exact") {
    return "";
  }

  const expectedOutput = challenge.expectedOutput.trim();
  if (!expectedOutput) {
    return "";
  }

  if (expectedOutput === "Relance l'apercu pour verifier le rendu visuel attendu.") {
    return "";
  }

  return expectedOutput;
}

function shouldPreserveCurrentPracticeCode({
  currentCode,
  practiceStarter,
  lessonStarter,
  language,
}: {
  currentCode: string;
  practiceStarter: string;
  lessonStarter: string;
  language: string;
}) {
  const normalizedCurrent = sanitizeValue(currentCode);
  if (!normalizedCurrent) {
    return false;
  }

  if (normalizedCurrent === sanitizeValue(practiceStarter)) {
    return true;
  }

  if (
    normalizedCurrent === sanitizeValue(lessonStarter) &&
    sanitizeValue(practiceStarter) !== sanitizeValue(lessonStarter)
  ) {
    return false;
  }

  return normalizedCurrent !== sanitizeValue(defaultStarterForLanguage(language));
}

function arePlaygroundsEqual(left: WebPlaygroundState, right: WebPlaygroundState) {
  return (
    left.html.trim() === right.html.trim() &&
    left.css.trim() === right.css.trim() &&
    left.js.trim() === right.js.trim()
  );
}
