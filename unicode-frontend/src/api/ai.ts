import { http } from "./http";

export type AiHintResponse = {
  hint: string;
  fallback: boolean;
  fallbackReason?: string | null;
};

export type AiIntent = "hint" | "explain" | "debug" | "solution";

export interface ExerciseHintRequest {
  question: string;
  options: string[];
  userMessage: string;
  intent?: AiIntent;
  language?: string;
  lessonTitle?: string;
  objective?: string;
  expectedOutput?: string;
  userCode?: string | null;
  consoleOutput?: string | null;
  explanation?: string | null;
  selectedAnswer?: string | null;
}

export interface PratiqueHintRequest {
  instructions: string;
  currentCode: string;
  userCode?: string;
  consoleOutput: string;
  userMessage: string;
  intent?: AiIntent;
  language?: string;
  lessonTitle?: string;
  objective?: string;
  expectedOutput?: string;
  currentError?: string;
}

export async function getExerciseHint(data: ExerciseHintRequest): Promise<AiHintResponse> {
  const res = await http.post<AiHintResponse>("/api/ai/hint/exercise", data);
  return res.data;
}

export async function getPratiqueHint(data: PratiqueHintRequest): Promise<AiHintResponse> {
  const res = await http.post<AiHintResponse>("/api/ai/hint/pratique", data);
  return res.data;
}
