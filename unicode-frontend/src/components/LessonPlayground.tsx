import { useMemo, useState } from "react";
import { runCode } from "../api/http";
import { getErrorMessage } from "../utils/errorMessage";
import { ensureWebLessonCode, isWebLanguage } from "../utils/webPlayground";

type LessonPlaygroundProps = {
  lessonTitle: string;
  editorLanguage?: string | null;
  practiceLanguage?: string | null;
  executionType?: string | null;
  starterCode?: string | null;
  code: string;
  onCodeChange: (nextCode: string) => void;
};

type ExecutionStatus = "idle" | "running" | "success" | "error" | "timeout";

type ExecutionState = {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  compileOutput: string;
  timedOut: boolean;
  exitCode: number | null;
};

const RUNNABLE_LANGUAGES = new Set(["python", "java", "c", "cpp", "csharp", "sql"]);

const LANGUAGE_ALIASES: Record<string, string> = {
  html: "html",
  css: "css",
  js: "javascript",
  javascript: "javascript",
  py: "python",
  python: "python",
  java: "java",
  c: "c",
  "c++": "cpp",
  cpp: "cpp",
  "c#": "csharp",
  csharp: "csharp",
  cs: "csharp",
  mysql: "sql",
  sql: "sql",
  text: "plaintext",
  plaintext: "plaintext",
};

const LANGUAGE_LABELS: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  sql: "MySQL",
  plaintext: "Code",
};

const DEFAULT_STARTER_CODE: Record<string, string> = {
  python: `print("Hello, UniCode Academy!")`,
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, UniCode Academy!");
  }
}`,
  c: `#include <stdio.h>

int main(void) {
  printf("Hello, UniCode Academy!\\n");
  return 0;
}`,
  cpp: `#include <iostream>

int main() {
  std::cout << "Hello, UniCode Academy!" << std::endl;
  return 0;
}`,
  csharp: `using System;

class Program {
  static void Main() {
    Console.WriteLine("Hello, UniCode Academy!");
  }
}`,
  sql: `CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(120)
);

INSERT INTO students (id, name) VALUES (1, 'Amina');
SELECT * FROM students;`,
  plaintext: `// Write your code here`,
};

const INITIAL_EXECUTION_STATE: ExecutionState = {
  status: "idle",
  stdout: "",
  stderr: "",
  compileOutput: "",
  timedOut: false,
  exitCode: null,
};

export default function LessonPlayground({
  lessonTitle,
  editorLanguage,
  practiceLanguage,
  executionType,
  starterCode,
  code,
  onCodeChange,
}: LessonPlaygroundProps) {
  const normalizedLanguage = useMemo(
    () => resolveLanguage(practiceLanguage, editorLanguage, lessonTitle, starterCode),
    [practiceLanguage, editorLanguage, lessonTitle, starterCode]
  );
  const languageLabel = LANGUAGE_LABELS[normalizedLanguage] ?? "Code";
  const supportsLivePreview = resolvePreviewMode(executionType, normalizedLanguage);
  const initialCode = useMemo(
    () => resolveStarterCode(normalizedLanguage, starterCode),
    [normalizedLanguage, starterCode]
  );

  const [previewDoc, setPreviewDoc] = useState<string>(() =>
    supportsLivePreview ? buildWebPreviewSource(normalizedLanguage, code) : ""
  );
  const [execution, setExecution] = useState<ExecutionState>(INITIAL_EXECUTION_STATE);

  const status = getStatusMetadata(supportsLivePreview, execution.status);
  const consoleText = useMemo(() => buildConsoleOutput(execution), [execution]);
  const isRunning = execution.status === "running";

  async function handleRun() {
    if (supportsLivePreview) {
      setPreviewDoc(buildWebPreviewSource(normalizedLanguage, code));
      return;
    }

    if (!RUNNABLE_LANGUAGES.has(normalizedLanguage)) {
      setExecution({
        status: "error",
        stdout: "",
        stderr: `Execution backend indisponible pour la langue: ${languageLabel}`,
        compileOutput: "",
        timedOut: false,
        exitCode: null,
      });
      return;
    }

    setExecution({
      status: "running",
      stdout: "",
      stderr: "",
      compileOutput: "",
      timedOut: false,
      exitCode: null,
    });

    try {
      const response = await runCode({
        language: normalizedLanguage,
        code,
      });

      let nextStatus: ExecutionStatus = response.success ? "success" : "error";
      if (response.timedOut) {
        nextStatus = "timeout";
      }

      setExecution({
        status: nextStatus,
        stdout: response.stdout ?? "",
        stderr: response.stderr ?? "",
        compileOutput: response.compileOutput ?? "",
        timedOut: response.timedOut,
        exitCode: response.exitCode,
      });
    } catch (error) {
      setExecution({
        status: "error",
        stdout: "",
        stderr: getErrorMessage(error, "Execution impossible."),
        compileOutput: "",
        timedOut: false,
        exitCode: null,
      });
    }
  }

  function handleReset() {
    onCodeChange(initialCode);
    setExecution(INITIAL_EXECUTION_STATE);

    if (supportsLivePreview) {
      setPreviewDoc(buildWebPreviewSource(normalizedLanguage, initialCode));
      return;
    }

    setPreviewDoc("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Espace pratique</h3>
          <p className="text-sm text-slate-600">
            Testez votre code avant de passer aux exercices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            {languageLabel}
          </span>
          <span className={status.className}>{status.label}</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Editeur
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleRun()}
                className="btn-primary"
                disabled={!supportsLivePreview && isRunning}
              >
                {!supportsLivePreview && isRunning ? "Running..." : "Run"}
              </button>
              <button type="button" onClick={handleReset} className="btn-secondary">
                Reset
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            spellCheck={false}
            className="h-[360px] w-full resize-y rounded-lg border border-slate-300 bg-slate-950 p-3 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-teal-500"
            aria-label="Code editor"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {supportsLivePreview ? "PREVIEW" : "CONSOLE"}
          </p>

          {supportsLivePreview ? (
            <iframe
              title="Lesson playground preview"
              sandbox="allow-scripts"
              srcDoc={previewDoc}
              className="h-[360px] w-full rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <pre
              className={`h-[360px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 ${
                execution.status === "error" || execution.status === "timeout"
                  ? "text-amber-200"
                  : "text-emerald-300"
              }`}
            >
              {consoleText}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusMetadata(supportsLivePreview: boolean, status: ExecutionStatus) {
  if (supportsLivePreview) {
    return {
      label: "Preview",
      className:
        "inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700",
    };
  }

  if (status === "running") {
    return {
      label: "Running",
      className:
        "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700",
    };
  }

  if (status === "success") {
    return {
      label: "Success",
      className:
        "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700",
    };
  }

  if (status === "timeout") {
    return {
      label: "Timed out",
      className:
        "inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700",
    };
  }

  if (status === "error") {
    return {
      label: "Error",
      className:
        "inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700",
    };
  }

  return {
    label: "Ready",
    className:
      "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700",
  };
}

function buildConsoleOutput(state: ExecutionState) {
  if (state.status === "idle") {
    return [
      "$ unicode-runner",
      "",
      "Ready to execute.",
      "Click Run to compile and execute your code.",
    ].join("\n");
  }

  if (state.status === "running") {
    return [
      "$ unicode-runner",
      "",
      "Execution in progress...",
      "Please wait.",
    ].join("\n");
  }

  const sections: string[] = [];

  if (state.compileOutput.trim()) {
    sections.push(["=== Compilation ===", state.compileOutput.trim()].join("\n"));
  }

  if (state.stdout.trim()) {
    sections.push(["=== Output ===", state.stdout.trim()].join("\n"));
  }

  if (state.stderr.trim()) {
    sections.push(["=== Errors ===", state.stderr.trim()].join("\n"));
  }

  if (state.timedOut) {
    sections.push("=== Timeout ===\nExecution exceeded the allowed time limit.");
  }

  if (sections.length === 0) {
    sections.push("Execution completed with no output.");
  }

  if (state.exitCode !== null) {
    sections.push(`Exit code: ${state.exitCode}`);
  }

  return sections.join("\n\n");
}

function resolvePreviewMode(executionType: string | null | undefined, normalizedLanguage: string) {
  if (isWebLanguage(normalizedLanguage)) {
    return true;
  }

  const type = executionType?.trim().toUpperCase();

  if (type === "WEB_PREVIEW" || type === "PREVIEW") {
    return true;
  }

  if (type === "API_RUNNER" || type === "COMPILE_RUN" || type === "RUNNER") {
    return false;
  }

  return false;
}

function resolveLanguage(
  practiceLanguage: string | null | undefined,
  editorLanguage: string | null | undefined,
  lessonTitle: string,
  starterCode: string | null | undefined
) {
  const normalizedPracticeLanguage = normalizeLanguage(practiceLanguage);
  if (normalizedPracticeLanguage) {
    return normalizedPracticeLanguage;
  }

  const normalizedFromField = normalizeLanguage(editorLanguage);
  if (normalizedFromField) {
    return normalizedFromField;
  }

  const inferredFromCode = inferLanguageFromCode(starterCode);
  if (inferredFromCode) {
    return inferredFromCode;
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

function inferLanguageFromCode(starterCode: string | null | undefined) {
  if (!starterCode) return null;
  const code = starterCode.trim();
  if (!code) return null;

  const lower = code.toLowerCase();

  if (/<html[\s>]|<!doctype html|<body[\s>]|<head[\s>]/i.test(code)) return "html";
  if (/<script[\s>]|document\.getelementbyid|console\.log\(/i.test(code)) return "javascript";
  if (/<style[\s>]|^\s*[.#a-z][\w\s\-#.:[\]()]+{[\s\S]*}/m.test(code)) return "css";
  if (/\bselect\b[\s\S]*\bfrom\b|\binsert\s+into\b|\bupdate\b[\s\S]*\bset\b/i.test(code)) return "sql";
  if (/\bconsole\.writeline\(|\bnamespace\b|\busing\s+system\b/i.test(code)) return "csharp";
  if (/\bstd::cout\b|#include\s*<iostream>|\busing\s+namespace\s+std\b/i.test(code)) return "cpp";
  if (/\bsystem\.out\.println\(|\bpublic\s+class\s+\w+|\bpublic\s+static\s+void\s+main\b/i.test(code)) return "java";
  if (/#include\s*<stdio\.h>|printf\s*\(/i.test(code)) return "c";
  if (/\bdef\s+\w+\s*\(|\bprint\s*\(|import\s+\w+/.test(lower) && !code.includes(";")) return "python";

  return null;
}

function normalizeLanguage(editorLanguage: string | null | undefined) {
  if (!editorLanguage) return null;
  const normalized = editorLanguage.trim().toLowerCase();
  if (!normalized) return null;
  const resolved = LANGUAGE_ALIASES[normalized] ?? normalized;
  if (resolved === "code" || resolved === "plaintext" || resolved === "text") {
    return null;
  }
  return resolved;
}

function resolveStarterCode(language: string, starterCode: string | null | undefined) {
  if (isWebLanguage(language)) {
    return ensureWebLessonCode(language, starterCode ?? "");
  }

  const safeStarterCode = sanitizeStarterCode(starterCode);
  if (safeStarterCode) {
    return safeStarterCode;
  }

  return DEFAULT_STARTER_CODE[language] ?? DEFAULT_STARTER_CODE.plaintext;
}

function buildWebPreviewSource(language: string, code: string) {
  return ensureWebLessonCode(language, code);
}

function sanitizeStarterCode(starterCode: string | null | undefined) {
  const trimmed = starterCode?.trim();
  if (!trimmed) return null;

  // Ignore legacy large-object OID references accidentally stored as starter code.
  if (/^\d{5,}$/.test(trimmed)) return null;

  return starterCode;
}
