import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { completeLesson, http } from "../api/http";
import { getCourses } from "../api/courses";
import { getMyLessonProgress, type LessonProgressDto } from "../api/http";
import AiAssistant from "../components/AiAssistant";
import {
  buildCoursePath,
  buildUnitLessonEntryPath,
  buildUnits,
  findUnitById,
  resolveLessonForUnit,
  type CourseLesson,
  type LessonExercise,
} from "../lib/academy";
import { queryKeys } from "../lib/queryKeys";
import { getErrorMessage } from "../utils/errorMessage";

type LessonDetail = CourseLesson & {
  exercises: LessonExercise[];
};

type UnitQuestion = LessonExercise & {
  lessonId: number;
  lessonTitle: string;
};

type AttemptResponse = {
  isCorrect: boolean;
  correctAnswer?: string | null;
};

export default function ExercicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId, unitId } = useParams<{ courseId: string; unitId: string }>();

  const numericCourseId = Number(courseId);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [checkedState, setCheckedState] = useState<AttemptResponse | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isCompletingUnit, setIsCompletingUnit] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [allowReplay, setAllowReplay] = useState(false);

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses(),
    queryFn: () => getCourses(),
  });

  const lessonProgressQuery = useQuery({
    queryKey: queryKeys.lessonProgress,
    queryFn: getMyLessonProgress,
    refetchOnMount: "always",
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
  const priorityLessonId = selectedUnit
    ? resolveLessonForUnit(selectedUnit, progressItems)?.id ?? selectedUnit.lessons[0]?.id ?? null
    : null;

  const detailsQuery = useQuery({
    queryKey: queryKeys.exerciseGroup(numericCourseId, selectedUnit?.id ?? "none", selectedUnitLessonIds),
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
    setAllowReplay(false);
  }, [numericCourseId, unitId]);

  useEffect(() => {
    const firstError = coursesQuery.error ?? lessonProgressQuery.error ?? courseLessonsQuery.error;

    if (firstError) {
      toast.error(getErrorMessage(firstError, "Impossible de charger les exercices."));
    }
  }, [courseLessonsQuery.error, coursesQuery.error, lessonProgressQuery.error]);

  useEffect(() => {
    if (detailsQuery.error) {
      toast.error(getErrorMessage(detailsQuery.error, "Impossible de charger les questions."));
    }
  }, [detailsQuery.error]);

  const questionPool = useMemo(() => {
    const questions = (detailsQuery.data ?? []).flatMap<UnitQuestion>((lesson) =>
      (lesson.exercises ?? []).map((exercise) => ({
        ...exercise,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        choices:
          exercise.choices && exercise.choices.length > 0
            ? exercise.choices
            : exercise.type === "TRUE_FALSE"
              ? ["Vrai", "Faux"]
              : exercise.choices,
      }))
    );

    const priorityQuestions = priorityLessonId
      ? shuffle(questions.filter((question) => question.lessonId === priorityLessonId))
      : [];
    const remainingQuestions = shuffle(
      priorityLessonId
        ? questions.filter((question) => question.lessonId !== priorityLessonId)
        : questions
    );

    return [...priorityQuestions, ...remainingQuestions].slice(
      0,
      Math.max(
        Math.min(questions.length, 10),
        questions.length > 0 ? Math.min(questions.length, 5) : 0
      )
    );
  }, [detailsQuery.data, priorityLessonId]);

  const currentQuestion =
    questionPool.length > 0 ? questionPool[questionIndex % questionPool.length] : null;
  const currentQuestionPosition =
    questionPool.length > 0 ? (questionIndex % questionPool.length) + 1 : 0;
  const progressPercent =
    questionPool.length > 0 ? (currentQuestionPosition / questionPool.length) * 100 : 0;
  const isLastQuestion = questionPool.length > 0 && currentQuestionPosition === questionPool.length;
  const nextUnit = selectedUnit
    ? units.find((unit) => unit.index === selectedUnit.index + 1) ?? null
    : null;
  const hasUnlockedNextUnit = Boolean(nextUnit && nextUnit.state !== "locked");
  const completionTargetPath = useMemo(() => {
    if (!Number.isFinite(numericCourseId)) {
      return "/apprendre";
    }

    if (nextUnit && nextUnit.state !== "locked") {
      return buildUnitLessonEntryPath(numericCourseId, nextUnit.id);
    }

    if (nextUnit && selectedUnit) {
      return buildUnitLessonEntryPath(numericCourseId, selectedUnit.id);
    }

    return buildCoursePath(numericCourseId);
  }, [nextUnit, numericCourseId, selectedUnit]);
  const isUnitCompleted = selectedUnit?.state === "completed";
  const showShortcutHint = questionIndex === 0;
  const handleKeyboardShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      !currentQuestion ||
      !isExerciseShortcutContextActive()
    ) {
      return;
    }

    const keyMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
    const index = keyMap[event.key.toLowerCase()];

    if (index !== undefined && !checkedState) {
      event.preventDefault();
      selectOption(index);
      return;
    }

    if (event.key === "Enter") {
      if (checkedState) {
        event.preventDefault();
        void handleContinue();
      } else if (selectedAnswer !== null) {
        event.preventDefault();
        handleCheck();
      }
    }
  });

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      handleKeyboardShortcut(event);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [checkedState, selectedAnswer]);

  if (!Number.isFinite(numericCourseId)) {
    return (
      <ExerciseStateCard
        title="Unite introuvable"
        message="Retourne a la carte du parcours pour relancer tes exercices."
        onBack={() => navigate("/apprendre")}
      />
    );
  }

  if (
    coursesQuery.isLoading ||
    lessonProgressQuery.isLoading ||
    courseLessonsQuery.isLoading ||
    detailsQuery.isLoading
  ) {
    return <ExerciseLoadingState />;
  }

  if (!course || !selectedUnit) {
    return (
      <ExerciseStateCard
        title="Aucun exercice disponible"
        message="Cette unite n'a pas encore de set d'exercices exploitable."
        onBack={() => navigate(`/apprendre/${numericCourseId}`)}
      />
    );
  }

  if (selectedUnit.state === "locked") {
    return (
      <ExerciseStateCard
        title="Unite verrouillee"
        message="Termine d'abord les unites precedentes pour ouvrir cette serie d'exercices."
        onBack={() => navigate(`/apprendre/${numericCourseId}`)}
      />
    );
  }

  const unit = selectedUnit;

  if ((isUnitCompleted || showCompletion) && !allowReplay) {
    return (
      <CompletedExerciseState
        unitTitle={`Unite ${unit.index} · ${unit.title}`}
        onContinue={() => navigate(completionTargetPath, { replace: true })}
        onReplay={() => {
          resetExerciseSession();
          setAllowReplay(true);
        }}
        onReviewLesson={() => navigate(buildUnitLessonEntryPath(numericCourseId, unit.id))}
        hasNextStep={hasUnlockedNextUnit}
        completedNow={showCompletion}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <ExerciseStateCard
        title="Aucun exercice disponible"
        message="Cette unite n'a pas encore de set d'exercices exploitable."
        onBack={() => navigate(`/apprendre/${numericCourseId}`)}
      />
    );
  }

  const parsedQuestion = parseQuestion(currentQuestion.question);
  const selectionInstruction = checkedState
    ? checkedState.isCorrect
      ? "Reponse validee. Tu peux passer a l'etape suivante."
      : "La verification est terminee. Relis la bonne reponse, puis clique sur Reessayer."
    : selectedAnswer
      ? "Reponse selectionnee. Clique maintenant sur Verifier pour confirmer."
      : "Clique sur une proposition pour la selectionner, puis clique sur Verifier.";

  function selectOption(index: number) {
    if (checkedState || !currentQuestion) {
      return;
    }

    const choice = currentQuestion.choices[index];
    if (choice === undefined) {
      return;
    }

    setSelectedAnswer(choice);
  }

  function nextQuestion() {
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer(null);
    setCheckedState(null);
  }

  function resetExerciseSession() {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCheckedState(null);
    setShowCompletion(false);
    setIsVerifying(false);
  }

  function handleRetry() {
    setSelectedAnswer(null);
    setCheckedState(null);
  }

  function handleCheck() {
    void handleVerify();
  }

  async function handleVerify() {
    if (!selectedAnswer || !currentQuestion) {
      return;
    }

    setIsVerifying(true);
    try {
      const response = await http.post<AttemptResponse>(
        `/api/exercises/${currentQuestion.id}/attempt`,
        { submittedAnswer: selectedAnswer }
      );

      setCheckedState({
        isCorrect: Boolean(response.data.isCorrect),
        correctAnswer: response.data.correctAnswer,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Verification impossible."));
    } finally {
      setIsVerifying(false);
    }
  }

  async function syncUnitCompletion(lessonIds: number[]) {
    if (isCompletingUnit) {
      return false;
    }

    setIsCompletingUnit(true);
    try {
      const results = await Promise.allSettled(
        lessonIds.map((lessonId) => completeLesson(lessonId))
      );
      const failedCount = results.filter((result) => result.status === "rejected").length;

      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: queryKeys.lessonProgress }),
        queryClient.invalidateQueries({ queryKey: queryKeys.progress }),
        queryClient.invalidateQueries({ queryKey: queryKeys.courseLessons(numericCourseId) }),
      ]);

      await Promise.allSettled([
        queryClient.refetchQueries({ queryKey: queryKeys.lessonProgress, exact: true, type: "active" }),
        queryClient.refetchQueries({ queryKey: queryKeys.progress, exact: true, type: "active" }),
      ]);

      if (failedCount > 0) {
        toast.error("Progression non synchronisee pour le moment.");
        return false;
      }

      return true;
    } finally {
      setIsCompletingUnit(false);
    }
  }

  async function handleContinue() {
    if (isLastQuestion) {
      const synced = await syncUnitCompletion(unit.lessons.map((lesson) => lesson.id));
      if (synced) {
        setShowCompletion(true);
      }
      return;
    }

    nextQuestion();
  }

  return (
    <>
      <div className={`fullscreen-page${aiOpen ? " has-ai-assistant" : ""}`}>
        <header className="fullscreen-topbar center-progress">
          <button
            type="button"
            className="topbar-back"
            onClick={() => navigate(`/apprendre/${numericCourseId}`)}
            aria-label="Retour au parcours"
          >
            ×
          </button>

          <div className="exercise-progress">
            <div className="prog-track prog-lg">
              <div className="prog-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: "var(--r-full)",
                background: "#818cf815",
                border: "1px solid #818cf830",
                color: "#818cf8",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all .15s",
                fontFamily: "var(--font)",
              }}
            >
              Aide guidee
            </button>
          </div>
        </header>

        <main
          className={`exercise-body${aiOpen ? " with-ai-assistant" : ""}`}
          data-exercise-shortcuts-root
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 120px)",
            padding: "24px 28px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingBottom: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <span className="badge badge-indigo">{mapExerciseType(currentQuestion.type)}</span>
            <h1 className="exercise-title">{parsedQuestion.text}</h1>
            <p className="exercise-hint">
              {currentQuestion.explanation ||
                `Question ${currentQuestionPosition} sur ${questionPool.length} dans cette serie.`}
            </p>

            {parsedQuestion.code ? (
              <pre className="lesson-code-block">
                <code>{parsedQuestion.code}</code>
              </pre>
            ) : null}

            <div className="exercise-options">
              {currentQuestion.choices.map((choice, index) => {
                const optionState = resolveOptionState(choice, selectedAnswer, checkedState);
                const optionLabel = resolveOptionLabel(optionState, selectedAnswer === choice, checkedState);
                return (
                  <button
                    key={`${currentQuestion.id}-${choice}-${index}`}
                    type="button"
                    className={`exercise-option${optionState ? ` ${optionState}` : ""}${checkedState ? " checked" : ""}`}
                    aria-pressed={selectedAnswer === choice}
                    onClick={() => {
                      selectOption(index);
                    }}
                  >
                    <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="exercise-option-copy">{choice}</span>
                    {optionLabel ? <span className="exercise-option-action">{optionLabel}</span> : null}
                  </button>
                );
              })}
            </div>

            <p className="exercise-selection-note">{selectionInstruction}</p>

            {showShortcutHint ? (
              <p className="exercise-shortcut-note">{/*
                Appuie sur A · B · C · D pour sélectionner, Entrée pour confirmer
              */}Clique sur une reponse puis sur Verifier. Les touches A, B, C, D et Entree
                restent disponibles si la zone d'exercice est active.
              </p>
            ) : null}

            {checkedState ? (
              <div className={`feedback-card ${checkedState.isCorrect ? "success" : "error"}`}>
                <span aria-hidden="true" style={{ fontSize: 22 }}>
                  {checkedState.isCorrect ? "OK" : "!"}
                </span>
                <div className="feedback-copy">
                  <p className="feedback-title">
                    {checkedState.isCorrect ? "Correct !" : "Pas tout a fait"}
                  </p>
                  <p className="feedback-text">
                    {checkedState.isCorrect
                      ? isLastQuestion
                        ? "Derniere verification validee. Tu peux maintenant terminer cette unite."
                        : "Bonne reponse. Passe a la question suivante."
                      : `La bonne reponse : ${checkedState.correctAnswer ?? "indisponible"}`}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div
            style={{
              flexShrink: 0,
              padding: "12px 0 20px",
              position: "sticky",
              bottom: 0,
              background: "var(--bg)",
            }}
          >
            {checkedState ? (
              <button
                type="button"
                className={`btn ${checkedState.isCorrect ? "btn-green" : "btn-danger"} btn-full btn-xl`}
                onClick={checkedState.isCorrect ? handleContinue : handleRetry}
                disabled={checkedState.isCorrect && isCompletingUnit}
              >
                {checkedState.isCorrect
                  ? isCompletingUnit
                    ? "Validation..."
                    : isLastQuestion
                      ? "Terminer l'unite"
                      : "Question suivante"
                  : "Reessayer"}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-full btn-xl"
                style={
                  selectedAnswer
                    ? undefined
                    : {
                        background: "var(--border-soft)",
                        color: "var(--text-3)",
                        boxShadow: "none",
                      }
                }
                onClick={handleCheck}
                disabled={!selectedAnswer || isVerifying}
              >
                {isVerifying ? "Verification..." : "Verifier"}
              </button>
            )}
          </div>
        </main>
      </div>

      <AiAssistant
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        mode="exercise"
        contextKey={`exercise-${numericCourseId}-${unit.id}-${currentQuestion?.id ?? "none"}`}
        language={course.languageCode ?? course.languageName}
        lessonTitle={currentQuestion?.lessonTitle}
        question={currentQuestion?.question}
        options={currentQuestion?.choices}
        explanation={currentQuestion?.explanation}
        selectedAnswer={selectedAnswer}
      />

      {/*
        <XPCelebration
          lessonTitle={`Unite ${unit.index} · ${unit.title}`}
          onContinue={() => navigate(completionTargetPath, { replace: true })}
        />
      */}
    </>
  );
}

function ExerciseLoadingState() {
  return (
    <div className="fullscreen-page">
      <header className="fullscreen-topbar center-progress">
        <span className="topbar-back">×</span>
        <div className="exercise-progress">
          <div className="prog-track prog-lg">
            <div className="prog-fill" style={{ width: "25%" }} />
          </div>
        </div>
        <div className="topbar-right">Exercices</div>
      </header>
      <div className="page" style={{ paddingTop: 24 }}>
        <div className="card content-section">
          <p className="text-muted">
            Nous preparons le set de questions de cette unite.
          </p>
        </div>
      </div>
    </div>
  );
}

function ExerciseStateCard({
  title,
  message,
  onBack,
}: {
  title: string;
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="fullscreen-page">
      <div className="page" style={{ paddingTop: 24 }}>
        <div className="card content-section page-stack">
          <p className="section-kicker">Exercices</p>
          <h1 className="section-title">{title}</h1>
          <p className="text-muted">{message}</p>
          <button type="button" className="btn btn-primary" onClick={onBack}>
            Revenir au parcours
          </button>
        </div>
      </div>
    </div>
  );
}

function CompletedExerciseState({
  unitTitle,
  onContinue,
  onReplay,
  onReviewLesson,
  hasNextStep,
  completedNow,
}: {
  unitTitle: string;
  onContinue: () => void;
  onReplay: () => void;
  onReviewLesson: () => void;
  hasNextStep: boolean;
  completedNow: boolean;
}) {
  return (
    <div className="fullscreen-page">
      <div className="page" style={{ paddingTop: 24 }}>
        <div className="card content-section page-stack">
          <p className="section-kicker">Exercices</p>
          <h1 className="section-title">{completedNow ? "Serie validee" : "Serie deja validee"}</h1>
          <p className="text-muted">
            {completedNow
              ? `${unitTitle} est maintenant marquee comme terminee. Tu peux poursuivre, revoir la lecon ou relancer la serie pour te reentrainer.`
              : `${unitTitle} est deja marquee comme terminee. Tu peux poursuivre, revoir la lecon ou relancer la serie si tu veux te reentrainer.`}
          </p>
          <div className="page-stack" style={{ gap: 10 }}>
            <button type="button" className="btn btn-primary" onClick={onContinue}>
              {hasNextStep ? "Continuer le parcours" : "Retourner au parcours"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onReviewLesson}>
              Revoir la lecon
            </button>
            <button type="button" className="btn btn-ghost" onClick={onReplay}>
              Refaire les exercices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* function renderHearts(value: number) {
  const safeValue = Math.max(0, Math.min(MAX_HEARTS, value));
  return "❤".repeat(safeValue) || "♡";
}

function writeHearts(value: number) {
  const safeValue = Math.max(0, Math.min(MAX_HEARTS, value));
  window.localStorage.setItem(HEARTS_STORAGE_KEY, String(safeValue));
  window.dispatchEvent(new CustomEvent("unicode-hearts-change"));
}
*/

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  return next;
}

function mapExerciseType(type: string) {
  const normalized = type.toUpperCase();
  if (normalized === "MCQ") {
    return "Choix multiple";
  }
  if (normalized === "TRUE_FALSE") {
    return "Vrai ou faux";
  }
  if (normalized === "CODE") {
    return "Completer le code";
  }
  return "Question";
}

function parseQuestion(question: string) {
  const match = question.match(/```[\w+-]*\n([\s\S]*?)```/);
  if (!match) {
    return {
      text: question.trim(),
      code: "",
    };
  }

  return {
    text: question.replace(match[0], "").trim(),
    code: match[1].trim(),
  };
}

function resolveOptionState(
  choice: string,
  selectedAnswer: string | null,
  checkedState: AttemptResponse | null
) {
  if (!checkedState) {
    return selectedAnswer === choice ? "selected" : "";
  }

  if (checkedState.isCorrect) {
    return selectedAnswer === choice ? "correct" : "";
  }

  if (selectedAnswer === choice) {
    return "wrong";
  }

  if ((checkedState.correctAnswer ?? "").toLowerCase() === choice.toLowerCase()) {
    return "correct";
  }

  return "";
}

function resolveOptionLabel(
  optionState: string,
  isSelected: boolean,
  checkedState: AttemptResponse | null
) {
  if (!checkedState) {
    return isSelected ? "Choisie" : "Cliquer";
  }

  if (optionState === "correct") {
    return "Correcte";
  }

  if (optionState === "wrong") {
    return "A corriger";
  }

  return "";
}

function isExerciseShortcutContextActive() {
  const activeElement = document.activeElement;
  const root = document.querySelector("[data-exercise-shortcuts-root]");

  if (isEditableElement(activeElement)) {
    return false;
  }

  if (activeElement instanceof Element && activeElement.closest("[data-ai-assistant-root]")) {
    return false;
  }

  if (!(activeElement instanceof HTMLElement) || !root) {
    return true;
  }

  if (
    activeElement === document.body ||
    activeElement === document.documentElement ||
    activeElement === root
  ) {
    return true;
  }

  return root.contains(activeElement);
}

function isEditableElement(element: Element | null) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const tagName = element.tagName.toLowerCase();
  return (
    element.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}
