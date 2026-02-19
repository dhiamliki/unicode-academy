import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, CheckCircle2, CircleX } from "lucide-react";
import { getMyLessonProgress, http, toggleLessonCompletion } from "../api/http";
import { getErrorMessage } from "../utils/errorMessage";

type Lesson = {
  id: number;
  title: string;
  content?: string;
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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const lessonRes = await http.get<LessonDetailsResponse>(`/api/lessons/${lessonId}`);
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

          setLesson({
            id: lessonRes.data.id,
            title: lessonRes.data.title,
            content: lessonRes.data.content,
          });
          setExercises(normalizedExercises);
          setSelectedByExerciseId({});
          setFeedbackByExerciseId({});
          setIsSubmittingAll(false);
          setHasSubmittedAll(false);
          setCompletionError(null);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Failed to load lesson";
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

  async function submitAllExercises() {
    if (isSubmittingAll || answerableExercises.length === 0) return;
    if (unansweredCount > 0 || hasUnanswerableExercises) return;

    setIsSubmittingAll(true);
    setHasSubmittedAll(false);
    setFeedbackByExerciseId({});

    try {
      const results = await Promise.all(
        answerableExercises.map(async (exercise) => {
          const submittedAnswer = selectedByExerciseId[exercise.id];

          try {
            const res = await http.post<AttemptResponse>(`/api/exercises/${exercise.id}/attempt`, {
              submittedAnswer,
            });
            return [exercise.id, res.data as ExerciseFeedback] as const;
          } catch (err: any) {
            const msg =
              err?.response?.data?.message ?? err?.message ?? "Submission failed";
            return [exercise.id, { error: msg, isCorrect: false } as ExerciseFeedback] as const;
          }
        })
      );

      const nextFeedbackByExerciseId: Record<number, ExerciseFeedback> = {};
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
      setCompletionError(getErrorMessage(err, "Unable to update lesson completion"));
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-800">
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      {loading && <p className="text-sm text-slate-600">Loading lesson...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && lesson && (
        <>
          <section className="panel p-6">
            <h2 className="text-2xl font-semibold text-slate-900">{lesson.title}</h2>

            {lesson.content ? (
              <div className="markdown-body mt-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No content yet.</p>
            )}
          </section>

          <section className="panel p-6">
            <h3 className="text-lg font-semibold text-slate-900">Exercises</h3>

            {exercises.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No exercises yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {exercises.map((exercise) => {
                  const selectedChoice = selectedByExerciseId[exercise.id] ?? "";
                  const feedback = feedbackByExerciseId[exercise.id];

                  return (
                    <li key={exercise.id} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-900">{exercise.question}</p>

                      {exercise.choices.length === 0 ? (
                        <p className="mt-2 text-sm text-red-700">No choices available for this question.</p>
                      ) : (
                        <div className="mt-3 space-y-2" role="radiogroup" aria-label={`Exercise ${exercise.id}`}>
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
                                Correct
                              </>
                            ) : (
                              <>
                                <CircleX className="h-4 w-4 text-red-500" />
                                Wrong
                              </>
                            )}
                          </p>

                          {feedback.explanation && (
                            <p className="mt-1 text-sm text-slate-700">{feedback.explanation}</p>
                          )}

                          {!feedback.isCorrect && feedback.correctAnswer && (
                            <p className="mt-1 text-sm text-slate-700">
                              Correct answer: <strong>{feedback.correctAnswer}</strong>
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
                  onClick={submitAllExercises}
                  disabled={
                    isSubmittingAll ||
                    answerableExercises.length === 0 ||
                    unansweredCount > 0 ||
                    hasUnanswerableExercises
                  }
                  className="btn-primary"
                >
                  {isSubmittingAll ? "Submitting all..." : "Submit all answers"}
                </button>

                {unansweredCount > 0 && (
                  <p className="text-sm text-slate-600">
                    Select answers for all questions before submitting ({unansweredCount} left).
                  </p>
                )}
                {hasUnanswerableExercises && (
                  <p className="text-sm text-red-700">
                    Some questions have no choices and cannot be submitted.
                  </p>
                )}
              </div>
            )}

            {hasSubmittedAll && submittedResults.length > 0 && (
              <p className="mt-4 text-sm font-semibold text-slate-900">
                Score: {correctCount} / {answerableExercises.length}
              </p>
            )}
          </section>

          <div className="space-y-2">
            <button type="button" onClick={toggleCompletion} className="btn-secondary">
              {completed ? "Mark as incomplete" : "Mark as completed"}
            </button>
            {!completed && exercises.length > 0 && (
              <p className="text-xs text-slate-600">
                You can complete this lesson only after attempting all exercises.
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

