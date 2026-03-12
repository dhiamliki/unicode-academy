import { isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, CheckCircle2, CircleX } from "lucide-react";
import { getMyLessonProgress, http, toggleLessonCompletion } from "../api/http";
import { getErrorMessage } from "../utils/errorMessage";
import LessonPlayground from "../components/LessonPlayground";
import { ensureWebLessonCode, insertSnippetIntoEditor, isWebLanguage } from "../utils/webPlayground";

type Lesson = {
  id: number;
  title: string;
  content?: string;
  starterCode?: string | null;
  editorLanguage?: string | null;
  practiceLanguage?: string | null;
  executionType?: string | null;
  sampleOutput?: string | null;
};

type LessonDetailsResponse = Lesson & {
  exercises?: Exercise[];
};

type Exercise = {
  id: number;
  type: "MCQ" | "CODE" | "TRUE_FALSE";
  question: string;
  choices: string[];
  explanation?: string;
  orderIndex: number;
};

type AttemptResponse = {
  isCorrect: boolean;
  explanation?: string | null;
  correctAnswer?: string | null;
};

type ExerciseFeedback = {
  isCorrect?: boolean;
  explanation?: string | null;
  correctAnswer?: string | null;
  error?: string;
};

const QUIZ_DURATION_SECONDS = 30 * 60;

export default function LessonDetails() {
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const [selectedByExerciseId, setSelectedByExerciseId] = useState<Record<number, string>>({});
  const [feedbackByExerciseId, setFeedbackByExerciseId] = useState<Record<number, ExerciseFeedback>>({});
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [hasSubmittedAll, setHasSubmittedAll] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(QUIZ_DURATION_SECONDS);
  const [timerMessage, setTimerMessage] = useState<string | null>(null);
  const [playgroundStarterCode, setPlaygroundStarterCode] = useState("");
  const [playgroundCode, setPlaygroundCode] = useState("");

  const timerTriggeredRef = useRef(false);
  const playgroundSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const lessonRes = await http.get<LessonDetailsResponse>(`/api/lessons/${lessonId}`);
        const lessonData = lessonRes.data;
        let fetchedExercises = Array.isArray(lessonRes.data.exercises)
          ? lessonRes.data.exercises
          : [];

        if (fetchedExercises.length === 0) {
          const exerciseRes = await http.get<Exercise[]>(`/api/lessons/${lessonId}/exercises`);
          fetchedExercises = exerciseRes.data;
        }

        if (!cancelled) {
          const deduplicatedExercises = Array.from(
            new Map(fetchedExercises.map((exercise) => [exercise.id, exercise])).values()
          );

          const normalizedExercises = deduplicatedExercises.sort(
            (a, b) => a.orderIndex - b.orderIndex
          );
          const lessonLanguage = normalizePracticeLanguage(
            lessonData.practiceLanguage ?? lessonData.editorLanguage,
            lessonData.title
          );
          const extractedStarterCode = selectBestStarterFromContent(lessonData.content, lessonLanguage);
          const resolvedStarterCode = resolveLessonStarterCode({
            lessonStarterCode: lessonData.starterCode,
            extractedStarterCode,
            practiceLanguage: lessonLanguage,
            lessonTitle: lessonData.title,
          });

          setLesson({
            id: lessonData.id,
            title: lessonData.title,
            content: lessonData.content,
            starterCode: lessonData.starterCode,
            editorLanguage: lessonData.editorLanguage,
            practiceLanguage: lessonData.practiceLanguage,
            executionType: lessonData.executionType,
            sampleOutput: lessonData.sampleOutput,
          });
          setExercises(normalizedExercises);
          setPlaygroundStarterCode(resolvedStarterCode);
          setPlaygroundCode(resolvedStarterCode);
          setSelectedByExerciseId({});
          setFeedbackByExerciseId({});
          setIsSubmittingAll(false);
          setHasSubmittedAll(false);
          setCompletionError(null);
          setTimeLeftSeconds(QUIZ_DURATION_SECONDS);
          setTimerMessage(null);
          timerTriggeredRef.current = false;
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Echec du chargement de la lecon";
        if (!cancelled) {
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (lessonId) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  useEffect(() => {
    if (!lessonId) return;

    getMyLessonProgress().then((res) => {
      const done = res.data.some(
        (progress: any) =>
          (progress.lessonId ?? progress.lesson?.id) === Number(lessonId) &&
          progress.status === "COMPLETED"
      );
      setCompleted(done);
    });
  }, [lessonId]);

  const answerableExercises = useMemo(
    () => exercises.filter((exercise) => exercise.choices.length > 0),
    [exercises]
  );

  const submittedResults = useMemo(
    () =>
      exercises
        .map((exercise) => feedbackByExerciseId[exercise.id])
        .filter(
          (feedback): feedback is ExerciseFeedback =>
            !feedback?.error && typeof feedback?.isCorrect === "boolean"
        ),
    [exercises, feedbackByExerciseId]
  );

  const correctCount = useMemo(
    () => submittedResults.filter((feedback) => feedback.isCorrect).length,
    [submittedResults]
  );

  const unansweredCount = useMemo(
    () =>
      answerableExercises.filter((exercise) => !selectedByExerciseId[exercise.id]).length,
    [answerableExercises, selectedByExerciseId]
  );

  const hasUnanswerableExercises = useMemo(
    () => exercises.some((exercise) => exercise.choices.length === 0),
    [exercises]
  );

  const isTimedOut = timeLeftSeconds <= 0;
  const lessonLanguage = useMemo(
    () =>
      lesson
        ? normalizePracticeLanguage(lesson.practiceLanguage ?? lesson.editorLanguage, lesson.title)
        : "plaintext",
    [lesson]
  );
  const lessonObjective = useMemo(
    () => extractLessonObjective(lesson?.content, lesson?.title ?? ""),
    [lesson?.content, lesson?.title]
  );

  useEffect(() => {
    if (loading || exercises.length === 0 || hasSubmittedAll || isSubmittingAll || isTimedOut) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTimeLeftSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loading, exercises.length, hasSubmittedAll, isSubmittingAll, isTimedOut, timeLeftSeconds]);

  useEffect(() => {
    if (!isTimedOut || hasSubmittedAll || isSubmittingAll || timerTriggeredRef.current) {
      return;
    }

    timerTriggeredRef.current = true;
    setTimerMessage("Le temps est ecoule. Les reponses selectionnees ont ete envoyees automatiquement.");
    void submitAllExercises({ allowPartial: true });
  }, [
    isTimedOut,
    hasSubmittedAll,
    isSubmittingAll,
    answerableExercises,
    selectedByExerciseId,
    hasUnanswerableExercises,
  ]);

  async function submitAllExercises(options?: { allowPartial?: boolean }) {
    const allowPartial = options?.allowPartial ?? false;

    if (isSubmittingAll || answerableExercises.length === 0) return;
    if (!allowPartial && (unansweredCount > 0 || hasUnanswerableExercises)) return;

    const exercisesToSubmit = allowPartial
      ? answerableExercises.filter((exercise) => Boolean(selectedByExerciseId[exercise.id]))
      : answerableExercises;

    setIsSubmittingAll(true);
    setHasSubmittedAll(false);
    setFeedbackByExerciseId({});

    if (!allowPartial) {
      setTimerMessage(null);
    }

    try {
      const results = await Promise.all(
        exercisesToSubmit.map(async (exercise) => {
          const submittedAnswer = selectedByExerciseId[exercise.id];

          try {
            const res = await http.post<AttemptResponse>(`/api/exercises/${exercise.id}/attempt`, {
              submittedAnswer,
            });
            return [exercise.id, res.data as ExerciseFeedback] as const;
          } catch (err: any) {
            const msg =
              err?.response?.data?.message ?? err?.message ?? "Echec de l'envoi";
            return [exercise.id, { error: msg, isCorrect: false } as ExerciseFeedback] as const;
          }
        })
      );

      const nextFeedbackByExerciseId: Record<number, ExerciseFeedback> = {};

      if (allowPartial) {
        answerableExercises.forEach((exercise) => {
          if (!selectedByExerciseId[exercise.id]) {
            nextFeedbackByExerciseId[exercise.id] = {
              error: "Aucune reponse n'a ete selectionnee avant la fin du temps.",
            };
          }
        });
      }

      results.forEach(([exerciseId, feedback]) => {
        nextFeedbackByExerciseId[exerciseId] = feedback;
      });

      setFeedbackByExerciseId(nextFeedbackByExerciseId);
      setHasSubmittedAll(true);
    } finally {
      setIsSubmittingAll(false);
    }
  }

  async function toggleCompletion() {
    if (!lessonId) return;
    setCompletionError(null);
    try {
      const updated = await toggleLessonCompletion(Number(lessonId));
      setCompleted(updated.status === "COMPLETED");
    } catch (err: unknown) {
      setCompletionError(getErrorMessage(err, "Impossible de mettre a jour l'etat de completion de la lecon"));
    }
  }

  function injectCodeInPlayground(exampleCode: string, snippetLanguage: string) {
    setPlaygroundCode((currentCode) =>
      insertSnippetIntoEditor({
        currentCode,
        snippet: exampleCode,
        lessonLanguage,
        snippetLanguage,
      })
    );
    window.requestAnimationFrame(() => {
      playgroundSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const markdownComponents: Components = {
    pre({ children, ...props }) {
      const firstChild = Array.isArray(children) ? children[0] : children;

      if (!isValidElement(firstChild)) {
        return <pre {...props}>{children}</pre>;
      }

      const childProps = firstChild.props as {
        className?: string;
        children?: unknown;
      };

      const rawCode = Array.isArray(childProps.children)
        ? childProps.children.join("").replace(/\n$/, "")
        : String(childProps.children ?? "").replace(/\n$/, "");
      const rawLanguageLabel = childProps.className?.replace("language-", "").trim() || lessonLanguage;
      const normalizedSnippetLanguage = normalizeSnippetLanguage(rawLanguageLabel);

      return (
        <div className="mt-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {normalizedSnippetLanguage}
            </span>
            <button
              type="button"
              onClick={() => injectCodeInPlayground(rawCode, normalizedSnippetLanguage)}
              className="btn-secondary px-3 py-1 text-xs"
            >
              Try in editor
            </button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
            <code className={childProps.className}>{rawCode}</code>
          </pre>
        </div>
      );
    },
  };

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-800">
        <ArrowLeft className="h-4 w-4" />
        Retour aux cours
      </Link>

      {loading && <p className="text-sm text-slate-600">Chargement de la lecon...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && lesson && (
        <>
          <section className="panel p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tutorial chapter</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{lesson.title}</h2>

            <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Objective</p>
              <p className="mt-1 text-sm text-slate-700">{lessonObjective}</p>
            </div>

            {lesson.content ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-900">Explanation and examples</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Read the chapter content, then push examples to the editor with{" "}
                  <strong>Try in editor</strong>.
                </p>
              </div>
            ) : null}

            {lesson.content ? (
              <div className="markdown-body mt-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {lesson.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Aucun contenu pour le moment.</p>
            )}
          </section>

          <section ref={playgroundSectionRef} className="panel p-6">
            <LessonPlayground
              key={`lesson-playground-${lesson.id}`}
              lessonTitle={lesson.title}
              editorLanguage={lesson.editorLanguage}
              practiceLanguage={lesson.practiceLanguage}
              executionType={lesson.executionType}
              starterCode={playgroundStarterCode}
              code={playgroundCode}
              onCodeChange={setPlaygroundCode}
            />
          </section>

          <section className="panel p-6">
            <h3 className="text-lg font-semibold text-slate-900">Exercices</h3>

            {exercises.length > 0 && (
              <div className="mt-3 space-y-2">
                <p
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm font-medium ${
                    isTimedOut
                      ? "border-red-200 bg-red-50 text-red-700"
                      : timeLeftSeconds <= 300
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-teal-200 bg-teal-50 text-teal-800"
                  }`}
                >
                  Minuteur du quiz : <span className="font-semibold">{formatDuration(timeLeftSeconds)}</span>
                </p>

                {timerMessage && (
                  <p className="text-sm text-amber-700">{timerMessage}</p>
                )}
              </div>
            )}

            {exercises.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">Aucun exercice pour le moment.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {exercises.map((exercise) => {
                  const selectedChoice = selectedByExerciseId[exercise.id] ?? "";
                  const feedback = feedbackByExerciseId[exercise.id];

                  return (
                    <li key={exercise.id} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-900">{exercise.question}</p>

                      {exercise.choices.length === 0 ? (
                        <p className="mt-2 text-sm text-red-700">Aucun choix disponible pour cette question.</p>
                      ) : (
                        <div className="mt-3 space-y-2" role="radiogroup" aria-label={`Exercice ${exercise.id}`}>
                          {exercise.choices.map((choice) => (
                            <label
                              key={`${exercise.id}-${choice}`}
                              className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                            >
                              <input
                                type="radio"
                                name={`exercise-${exercise.id}`}
                                value={choice}
                                checked={selectedChoice === choice}
                                disabled={hasSubmittedAll || isSubmittingAll || isTimedOut}
                                onChange={() => {
                                  setHasSubmittedAll(false);
                                  setSelectedByExerciseId((prev) => ({ ...prev, [exercise.id]: choice }));
                                }}
                                className="h-4 w-4 border-slate-300"
                              />
                              {choice}
                            </label>
                          ))}
                        </div>
                      )}

                      {hasSubmittedAll && feedback?.error && (
                        <p className="mt-3 text-sm text-red-700">{feedback.error}</p>
                      )}

                      {hasSubmittedAll && typeof feedback?.isCorrect === "boolean" && !feedback.error && (
                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                            {feedback.isCorrect ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                                Bonne reponse
                              </>
                            ) : (
                              <>
                                <CircleX className="h-4 w-4 text-red-500" />
                                Mauvaise reponse
                              </>
                            )}
                          </p>

                          {feedback.explanation && (
                            <p className="mt-1 text-sm text-slate-700">{feedback.explanation}</p>
                          )}

                          {!feedback.isCorrect && feedback.correctAnswer && (
                            <p className="mt-1 text-sm text-slate-700">
                              Reponse correcte : <strong>{feedback.correctAnswer}</strong>
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {exercises.length > 0 && (
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => void submitAllExercises()}
                  disabled={
                    isSubmittingAll ||
                    isTimedOut ||
                    answerableExercises.length === 0 ||
                    unansweredCount > 0 ||
                    hasUnanswerableExercises
                  }
                  className="btn-primary"
                >
                  {isSubmittingAll ? "Envoi en cours..." : "Envoyer toutes les reponses"}
                </button>

                {!isTimedOut && unansweredCount > 0 && (
                  <p className="text-sm text-slate-600">
                    Selectionnez des reponses pour toutes les questions avant l'envoi ({unansweredCount} restantes).
                  </p>
                )}
                {hasUnanswerableExercises && (
                  <p className="text-sm text-red-700">
                    Certaines questions n'ont aucun choix et ne peuvent pas etre envoyees.
                  </p>
                )}
              </div>
            )}

            {hasSubmittedAll && answerableExercises.length > 0 && (
              <p className="mt-4 text-sm font-semibold text-slate-900">
                Resultat : {correctCount} / {answerableExercises.length}
              </p>
            )}
          </section>

          <div className="space-y-2">
            <button type="button" onClick={toggleCompletion} className="btn-secondary">
              {completed ? "Marquer comme non terminee" : "Marquer comme terminee"}
            </button>
            {!completed && exercises.length > 0 && (
              <p className="text-xs text-slate-600">
                Vous pouvez terminer cette lecon uniquement apres avoir tente tous les exercices.
              </p>
            )}
            {completionError && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {completionError}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

type ParsedCodeBlock = {
  language: string;
  code: string;
};

const LESSON_LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  javascript: "javascript",
  py: "python",
  cplusplus: "cpp",
  "c++": "cpp",
  cpp: "cpp",
  "c#": "csharp",
  cs: "csharp",
  csharp: "csharp",
  mysql: "sql",
  sql: "sql",
  text: "plaintext",
  plaintext: "plaintext",
};

function selectBestStarterFromContent(content: string | undefined, language: string) {
  const blocks = extractCodeBlocks(content);
  if (blocks.length === 0) {
    return null;
  }

  const exactMatch = blocks.find((block) => normalizeSnippetLanguage(block.language) === language);
  if (exactMatch) {
    return exactMatch.code;
  }

  const nonShellBlock = blocks.find((block) => normalizeSnippetLanguage(block.language) !== "bash");
  return nonShellBlock?.code ?? blocks[0].code;
}

function extractCodeBlocks(content: string | undefined) {
  if (!content) return [] as ParsedCodeBlock[];

  const blocks: ParsedCodeBlock[] = [];
  const fencedCodeRegex = /```([\w#+-]*)\r?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = fencedCodeRegex.exec(content)) !== null) {
    const code = (match[2] ?? "").trim();
    if (!code) continue;

    blocks.push({
      language: (match[1] ?? "").trim().toLowerCase(),
      code,
    });
  }

  return blocks;
}

function resolveLessonStarterCode(params: {
  lessonStarterCode?: string | null;
  extractedStarterCode?: string | null;
  practiceLanguage?: string | null;
  lessonTitle: string;
}) {
  const language = normalizePracticeLanguage(params.practiceLanguage, params.lessonTitle);
  const fromLesson = normalizeStarterCandidate(params.lessonStarterCode);
  const fromContent = normalizeStarterCandidate(params.extractedStarterCode);
  const resolvedStarter = fromLesson || fromContent || defaultStarterByLanguage(language, params.lessonTitle);
  if (isWebLanguage(language)) {
    return ensureWebLessonCode(language, resolvedStarter);
  }
  return resolvedStarter;
}

function normalizeStarterCandidate(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (isLegacyOidReference(trimmed)) {
    return null;
  }

  return trimmed;
}

function isLegacyOidReference(value: string) {
  return /^\d{5,}$/.test(value);
}

function normalizePracticeLanguage(practiceLanguage: string | null | undefined, lessonTitle: string) {
  const rawLanguage = practiceLanguage?.trim().toLowerCase();
  if (rawLanguage) {
    return normalizeSnippetLanguage(rawLanguage);
  }

  const title = lessonTitle.toLowerCase();
  if (title.includes("html")) return "html";
  if (title.includes("css")) return "css";
  if (title.includes("javascript") || title.includes(" js")) return "javascript";
  if (title.includes("python")) return "python";
  if (title.includes("java")) return "java";
  if (title.includes("c++") || title.includes("cpp")) return "cpp";
  if (title.includes("c#") || title.includes("csharp")) return "csharp";
  if (title.includes("mysql") || title.includes("sql")) return "sql";
  if (/\bc\b/.test(title)) return "c";
  return "plaintext";
}

function normalizeSnippetLanguage(rawLanguage: string | null | undefined) {
  if (!rawLanguage) return "plaintext";
  const normalized = rawLanguage.trim().toLowerCase();
  return LESSON_LANGUAGE_ALIASES[normalized] ?? normalized;
}

function defaultStarterByLanguage(language: string, lessonTitle: string) {
  const title = lessonTitle.toLowerCase();
  const isVariablesLesson = title.includes("variable") || title.includes("type");

  if (language === "html") {
    return ensureWebLessonCode("html", "");
  }

  if (language === "css") {
    return ensureWebLessonCode("css", "");
  }

  if (language === "javascript") {
    return ensureWebLessonCode("javascript", "");
  }

  if (language === "python") {
    if (isVariablesLesson) {
      return `age = 20
note = 15.5
lettre = "A"
print(f"age={age} note={note} lettre={lettre}")`;
    }
    return `print("Hello, UniCode Academy!")`;
  }

  if (language === "java") {
    if (isVariablesLesson) {
      return `int age = 20;
double note = 15.5;
char lettre = 'A';
System.out.println("age=" + age + " note=" + note + " lettre=" + lettre);`;
    }
    return `System.out.println("Hello, UniCode Academy!");`;
  }

  if (language === "c") {
    if (isVariablesLesson) {
      return `int age = 20;
double note = 15.5;
char lettre = 'A';
printf("age=%d note=%.1f lettre=%c\\n", age, note, lettre);`;
    }
    return `printf("Hello, UniCode Academy!\\n");`;
  }

  if (language === "cpp") {
    if (isVariablesLesson) {
      return `int age = 20;
double note = 15.5;
char lettre = 'A';
cout << "age=" << age << " note=" << note << " lettre=" << lettre << endl;`;
    }
    return `cout << "Hello, UniCode Academy!" << endl;`;
  }

  if (language === "csharp") {
    if (isVariablesLesson) {
      return `int age = 20;
double note = 15.5;
char lettre = 'A';
Console.WriteLine($"age={age} note={note} lettre={lettre}");`;
    }
    return `Console.WriteLine("Hello, UniCode Academy!");`;
  }

  if (language === "mysql" || language === "sql") {
    return `CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(120)
);

INSERT INTO students (id, name) VALUES (1, 'Amina');
SELECT * FROM students;`;
  }

  return `// Ecrivez votre code ici`;
}

function extractLessonObjective(content: string | undefined, lessonTitle: string) {
  if (!content) {
    return `Understand the key concepts covered in ${lessonTitle}.`;
  }

  const objectiveMatch = content.match(/(?:^|\n)#{1,6}\s*objectif\s*\n+([^\n]+)/i);
  if (objectiveMatch?.[1]?.trim()) {
    return objectiveMatch[1].trim();
  }

  const paragraphMatch = content
    .replace(/```[\s\S]*?```/g, "")
    .match(/(?:^|\n)(?!#)([^\n]{20,})/);

  if (paragraphMatch?.[1]?.trim()) {
    return paragraphMatch[1].trim();
  }

  return `Understand the key concepts covered in ${lessonTitle}.`;
}

