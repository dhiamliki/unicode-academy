import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import {
  getExerciseHint,
  getPratiqueHint,
  type AiHintResponse,
  type AiIntent,
} from "../api/ai";

type AiAssistantProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: "exercise" | "pratique";
  contextKey: string;
  language?: string;
  lessonTitle?: string;
  question?: string;
  options?: string[];
  explanation?: string | null;
  selectedAnswer?: string | null;
  instructions?: string;
  objective?: string;
  expectedOutput?: string;
  currentCode?: string;
  consoleOutput?: string;
  currentError?: string;
};

type Message = {
  role: "request" | "coach";
  content: string;
  fallbackReason?: string | null;
};

type SessionSnapshot = {
  messages: Message[];
  input: string;
};

type Suggestion = {
  label: string;
  description: string;
  prompt: string;
  intent: AiIntent;
};

type LocalFallbackContext = {
  mode: "exercise" | "pratique";
  intent: AiIntent;
  language?: string;
  lessonTitle?: string;
  question?: string;
  options?: string[];
  explanation?: string | null;
  selectedAnswer?: string | null;
  instructions?: string;
  objective?: string;
  expectedOutput?: string;
  currentCode?: string;
  consoleOutput?: string;
  currentError?: string;
  userMessage: string;
};

const EXERCISE_SUGGESTIONS: Suggestion[] = [
  {
    label: "Donne-moi un indice",
    description: "Un repere court pour repartir sans reveler la reponse.",
    prompt: "Donne-moi un indice sans me donner directement la bonne reponse.",
    intent: "hint",
  },
  {
    label: "Explique le concept",
    description: "Un rappel simple de la notion testee dans cette question.",
    prompt: "Explique le concept teste par cette question avec un exemple simple.",
    intent: "explain",
  },
  {
    label: "Pourquoi ma reponse est fausse ?",
    description: "Un diagnostic sur l'erreur ou le piege le plus probable.",
    prompt: "Aide-moi a comprendre pourquoi ma reponse est piegeuse ou incorrecte.",
    intent: "debug",
  },
  {
    label: "Montre-moi la prochaine etape",
    description: "Le prochain pas utile sans donner la solution complete.",
    prompt: "Montre-moi la prochaine etape sans me donner la reponse complete.",
    intent: "hint",
  },
];

const PRATIQUE_SUGGESTIONS: Suggestion[] = [
  {
    label: "Donne-moi un indice",
    description: "Un indice progressif pour te remettre sur les rails.",
    prompt: "Donne-moi un indice progressif sans ecrire la solution complete.",
    intent: "hint",
  },
  {
    label: "Explique le concept",
    description: "Un rappel clair avant de toucher a ton code.",
    prompt: "Explique-moi le concept de cette lecon simplement avant que je continue.",
    intent: "explain",
  },
  {
    label: "Pourquoi mon code bloque ?",
    description: "Le premier point de verification a controler dans ton code.",
    prompt: "Aide-moi a debugger ce code et dis-moi quoi verifier en premier.",
    intent: "debug",
  },
  {
    label: "Montre-moi la prochaine etape",
    description: "Le prochain pas utile sans reecrire tout le defi.",
    prompt: "Montre-moi la prochaine etape sans ecrire la solution complete.",
    intent: "hint",
  },
];

export default function AiAssistant({
  isOpen,
  onClose,
  mode,
  contextKey,
  language,
  lessonTitle,
  question,
  options,
  explanation,
  selectedAnswer,
  instructions,
  objective,
  expectedOutput,
  currentCode,
  consoleOutput,
  currentError,
}: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const sessionsRef = useRef<Record<string, SessionSnapshot>>({});

  useEffect(() => {
    requestIdRef.current += 1;
    setLoading(false);
    setStatusNote(null);

    const session = sessionsRef.current[contextKey];
    if (!session) {
      setMessages([]);
      setInput("");
      return;
    }

    setMessages(session.messages);
    setInput(session.input);
  }, [contextKey]);

  useEffect(() => {
    sessionsRef.current[contextKey] = {
      messages,
      input,
    };
  }, [contextKey, input, messages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, loading, messages]);

  const suggestions = mode === "exercise" ? EXERCISE_SUGGESTIONS : PRATIQUE_SUGGESTIONS;
  const contextSummary = useMemo(
    () => buildContextSummary(mode, lessonTitle, language),
    [language, lessonTitle, mode]
  );

  async function handleSend(payload?: { text?: string; intent?: AiIntent; preview?: string }) {
    const rawMessage = (payload?.text ?? input).trim();
    if (!rawMessage || loading) {
      return;
    }

    const requestedIntent = payload?.intent ?? detectIntent(rawMessage);
    const resolvedIntent = requestedIntent === "solution" ? "hint" : requestedIntent;
    const messageText = sanitizeHelpRequest(rawMessage, requestedIntent);
    const requestId = ++requestIdRef.current;

    setMessages((prev) => [
      ...prev,
      {
        role: "request",
        content: payload?.preview ?? buildRequestPreview(messageText, requestedIntent),
      },
    ]);
    setInput("");
    setLoading(true);
    setStatusNote(null);

    try {
      const response =
        mode === "exercise"
          ? await getExerciseHint({
              question: question ?? "",
              options: options ?? [],
              userMessage: messageText,
              intent: resolvedIntent,
              language,
              lessonTitle,
              objective,
              expectedOutput,
              userCode: currentCode ?? null,
              consoleOutput: consoleOutput ?? null,
              explanation,
              selectedAnswer,
            })
          : await getPratiqueHint({
              instructions: instructions ?? "",
              objective,
              expectedOutput,
              currentCode: currentCode ?? "",
              userCode: currentCode ?? "",
              consoleOutput: consoleOutput ?? "",
              currentError,
              userMessage: messageText,
              intent: resolvedIntent,
              language,
              lessonTitle,
            });

      if (requestId !== requestIdRef.current) {
        return;
      }

      pushCoachMessage(response);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const localFallback = buildLocalFallbackResponse({
        mode,
        intent: resolvedIntent,
        language,
        lessonTitle,
        question,
        options,
        explanation,
        selectedAnswer,
        instructions,
        objective,
        expectedOutput,
        currentCode,
        consoleOutput,
        currentError,
        userMessage: messageText,
      });

      pushCoachMessage(localFallback);
      setStatusNote(
        "Le coach detaille est indisponible pour le moment. La reponse ci-dessous provient du guidage local."
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  function pushCoachMessage(response: AiHintResponse) {
    setMessages((prev) => [
      ...prev,
      {
        role: "coach",
        content: response.hint,
        fallbackReason: response.fallback ? mapFallbackReason(response.fallbackReason) : null,
      },
    ]);
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    event.stopPropagation();
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  function handleDrawerKeyDownCapture(event: KeyboardEvent<HTMLElement>) {
    if (isExerciseShortcutKey(event.key)) {
      event.stopPropagation();
    }
  }

  function handleSuggestionClick(suggestion: Suggestion) {
    if (loading) {
      return;
    }

    void handleSend({
      text: suggestion.prompt,
      intent: suggestion.intent,
      preview: suggestion.label,
    });
  }

  const lastCoachMessage =
    [...messages].reverse().find((message) => message.role === "coach") ?? null;

  return (
    <aside
      className={`ai-assistant-drawer${isOpen ? " is-open" : ""}`}
      aria-hidden={!isOpen}
      aria-label="Aide guidee"
      data-ai-assistant-root
      onKeyDownCapture={handleDrawerKeyDownCapture}
    >
      <div className="ai-assistant-header">
        <div className="ai-assistant-header-copy">
          <span className="ai-assistant-robot" aria-hidden="true">
            A
          </span>
          <div className="ai-assistant-title-wrap">
            <span className="ai-assistant-title">Aide guidee</span>
            <span className="ai-assistant-beta">Coach</span>
          </div>
        </div>

        <button
          type="button"
          className="ai-assistant-close"
          onClick={onClose}
          aria-label="Fermer l'aide guidee"
        >
          {"\u2715"}
        </button>
      </div>

      <div className="ai-assistant-suggestions">
        <div className="ai-assistant-context">
          <p className="ai-assistant-section-label">Repere actuel</p>
          <p className="ai-assistant-context-copy">{contextSummary}</p>
          <p className="ai-assistant-context-note">
            Choisis une aide rapide pour obtenir un indice, une explication ou la
            prochaine etape utile.
          </p>
        </div>

        {lastCoachMessage?.fallbackReason ? (
          <div className="ai-assistant-banner">
            <strong>Guidage local actif</strong>
            <span>{lastCoachMessage.fallbackReason}</span>
          </div>
        ) : null}

        <p className="ai-assistant-section-label">Aides rapides</p>
        <div className="ai-assistant-suggestion-list">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              className="ai-assistant-suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <strong>{suggestion.label}</strong>
              <span>{suggestion.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ai-assistant-messages">
        {messages.length === 0 && !loading ? (
          <div className="ai-assistant-empty">
            <span className="ai-assistant-empty-robot" aria-hidden="true">
              A
            </span>
            <p>Choisis une aide rapide pour debloquer la suite sans passer par un chat libre.</p>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`ai-assistant-message-row ${message.role}`}
          >
            {message.role === "coach" ? (
              <span className="ai-assistant-bot-label">Repere guide</span>
            ) : (
              <span className="ai-assistant-request-tag">Action demandee</span>
            )}

            <div className={`ai-assistant-bubble ${message.role}`}>
              {message.role === "coach" ? (
                <ReactMarkdown
                  components={{
                    pre: ({ children }) => <pre className="lesson-code-block">{children}</pre>,
                    code: ({ className, children, ...props }) =>
                      className ? (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className="inline-code" {...props}>
                          {children}
                        </code>
                      ),
                    p: ({ children }) => <p>{children}</p>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                message.content
              )}
            </div>

            {message.role === "coach" && message.fallbackReason ? (
              <span className="ai-assistant-message-meta">{message.fallbackReason}</span>
            ) : null}
          </div>
        ))}

        {loading ? (
          <div className="ai-assistant-message-row coach">
            <span className="ai-assistant-bot-label">Repere guide</span>
            <div className="ai-assistant-bubble coach ai-assistant-loading-bubble">
              <span className="ai-assistant-dot" />
              <span className="ai-assistant-dot" />
              <span className="ai-assistant-dot" />
            </div>
          </div>
        ) : null}

        {statusNote ? (
          <div className="ai-assistant-status">
            <strong>Guidage local actif</strong>
            <span>{statusNote}</span>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div className="ai-assistant-input">
        <div className="ai-assistant-input-copy">
          <span className="ai-assistant-section-label">Preciser mon blocage</span>
          <span className="ai-assistant-input-help">
            Optionnel: ajoute une phrase si les aides rapides ne suffisent pas.
          </span>
        </div>

        <div className="ai-assistant-input-row">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Ex: je ne comprends pas pourquoi ma condition reste fausse"
            className="ai-assistant-textarea"
            rows={2}
          />
          <button
            type="button"
            className="ai-assistant-send"
            onClick={() => void handleSend()}
            disabled={!input.trim() || loading}
            aria-label="Envoyer un detail"
          >
            {"\u27A4"}
          </button>
        </div>
      </div>
    </aside>
  );
}

function isExerciseShortcutKey(key: string) {
  const normalizedKey = key.toLowerCase();
  return normalizedKey === "enter" || ["a", "b", "c", "d"].includes(normalizedKey);
}

function buildContextSummary(
  mode: "exercise" | "pratique",
  lessonTitle?: string,
  language?: string
) {
  const areaLabel = mode === "exercise" ? "Exercices" : "Pratique";
  const title = lessonTitle?.trim();
  const normalizedLanguage = language?.trim();

  if (title && normalizedLanguage) {
    return `${areaLabel} - ${title} - ${normalizedLanguage.toUpperCase()}`;
  }

  if (title) {
    return `${areaLabel} - ${title}`;
  }

  if (normalizedLanguage) {
    return `${areaLabel} - ${normalizedLanguage.toUpperCase()}`;
  }

  return areaLabel;
}

function mapFallbackReason(reason?: string | null) {
  if (reason === "configuration_absente") {
    return "Le service detaille n'est pas configure ici. L'aide continue avec un guidage local fiable.";
  }

  if (reason === "service_indisponible") {
    return "Le service detaille ne repond pas pour le moment. L'aide continue avec un guidage local.";
  }

  if (reason === "client_local") {
    return "Le service d'aide a rencontre un probleme. Un repere local prend le relais dans cette session.";
  }

  return "Cette reponse provient du guidage local integre.";
}

function sanitizeHelpRequest(message: string, intent: AiIntent) {
  if (intent === "solution") {
    return "Montre-moi la prochaine etape sans donner la solution complete.";
  }

  return message;
}

function buildRequestPreview(message: string, intent: AiIntent) {
  if (intent === "debug") {
    return "Pourquoi ca bloque ?";
  }

  if (intent === "explain") {
    return "Explique le concept";
  }

  if (intent === "solution") {
    return "Montre-moi la prochaine etape";
  }

  const compact = message.replace(/\s+/g, " ").trim();
  if (compact.length <= 54) {
    return compact;
  }

  return `${compact.slice(0, 51).trim()}...`;
}

function detectIntent(message: string): AiIntent {
  const normalized = normalizeIntentText(message);

  if (
    containsIntentKeyword(normalized, ["pourquoi", "erreur", "marche pas", "marchepas", "bug", "debug"])
  ) {
    return "debug";
  }

  if (
    containsIntentKeyword(normalized, ["explique", "concept", "definition", "definis", "signifie"])
  ) {
    return "explain";
  }

  if (containsIntentKeyword(normalized, ["indice", "hint", "aide moi sans", "guide moi"])) {
    return "hint";
  }

  if (
    containsIntentKeyword(normalized, [
      "donne moi",
      "donne-moi",
      "montre moi",
      "montre-moi",
      "code",
      "solution",
      "reponse complete",
      "reponse finale",
    ])
  ) {
    return "solution";
  }

  return "hint";
}

function containsIntentKeyword(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function normalizeIntentText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildLocalFallbackResponse(context: LocalFallbackContext): AiHintResponse {
  return {
    hint: buildLocalFallbackMessage(context),
    fallback: true,
    fallbackReason: "client_local",
  };
}

function buildLocalFallbackMessage(context: LocalFallbackContext) {
  switch (context.intent) {
    case "solution":
      return buildLocalSolutionMessage(context);
    case "debug":
      return buildLocalDebugMessage(context);
    case "explain":
      return buildLocalExplainMessage(context);
    default:
      return buildLocalHintMessage(context);
  }
}

function buildLocalSolutionMessage(context: LocalFallbackContext) {
  const sections: string[] = [];
  const likelyOption =
    context.mode === "exercise"
      ? detectLikelyExerciseOption(context.question, context.options)
      : "";

  if (likelyOption) {
    sections.push(`La reponse la plus probable ici est \`${likelyOption}\`.`);
  }

  sections.push(
    "Voici une solution locale simple qui illustre l'idee demandee :",
    markdownCodeFence(
      toCodeFenceLanguage(context.language),
      buildLocalSolutionCode(
        context.language,
        joinLocalContext(context.objective, context.instructions, context.question, context.userMessage),
        context.expectedOutput
      )
    )
  );

  return sections.join("\n\n");
}

function buildLocalDebugMessage(context: LocalFallbackContext) {
  const currentError = (context.currentError ?? "").trim();
  const currentCode = context.currentCode ?? "";
  const consoleText = (context.consoleOutput ?? "").trim();
  const expectedOutput = (context.expectedOutput ?? "").trim();

  if (currentError) {
    return `Le premier blocage visible est : "${firstLocalLine(currentError)}". Corrige d'abord ce message, puis relance le code.`;
  }

  if (looksLikeAssignmentInCondition(currentCode, context.language)) {
    return "Dans ta condition, tu sembles utiliser `=` au lieu d'un operateur de comparaison. Remplace-le d'abord par `==`, puis relance.";
  }

  if (consoleText && expectedOutput) {
    return `Compare d'abord ta sortie actuelle "${compactLocal(consoleText, 80)}" avec l'attendu "${compactLocal(expectedOutput, 80)}". Corrige une seule difference, puis execute a nouveau.`;
  }

  if (!consoleText && !currentCode.trim()) {
    return "Je n'ai pas encore assez de code a analyser. Colle ton code actuel ou relance une execution pour obtenir un diagnostic plus precis.";
  }

  return "Relance le code apres une seule correction ciblee, puis regarde si la sortie se rapproche vraiment de l'attendu.";
}

function buildLocalExplainMessage(context: LocalFallbackContext) {
  const topic = detectLocalTopic(context.lessonTitle, context.objective, context.instructions, context.question);
  const language = humanLanguage(context.language);

  switch (topic) {
    case "operators":
      return `En ${language}, les operateurs servent a calculer, comparer ou combiner des conditions. Le bon choix depend du comportement exact demande dans l'exercice.`;
    case "conditions":
      return "Une condition sert a choisir quel bloc de code doit s'executer selon qu'un test est vrai ou faux.";
    case "loops":
      return "Une boucle repete un bloc de code jusqu'a ce qu'une condition change ou qu'un nombre de tours soit atteint.";
    case "html":
      return "HTML definit la structure du contenu. Verifie d'abord quelles balises doivent apparaitre dans la page.";
    case "css":
      return "CSS modifie l'apparence des elements deja presents. Commence par identifier le bon selecteur puis la bonne propriete.";
    case "javascript":
      return "JavaScript ajoute le comportement: il lit des valeurs, reagit aux evenements et modifie le DOM quand c'est necessaire.";
    default:
      return `Le plus important ici est de relier l'objectif de la lecon en ${language} au resultat concret que ton code doit produire.`;
  }
}

function buildLocalHintMessage(context: LocalFallbackContext) {
  const expectedOutput = (context.expectedOutput ?? "").trim();
  const goal = firstNonEmptyLocal(context.objective, context.instructions, context.question) || "l'objectif du defi";

  if (expectedOutput) {
    return `Commence par viser ceci : "${compactLocal(expectedOutput, 80)}". Fais une seule modification dans ton code pour te rapprocher de ce resultat, puis execute a nouveau.`;
  }

  return `Indice progressif : concentre-toi d'abord sur ${compactLocal(goal, 110)}. Une petite correction bien ciblee vaut mieux qu'une reecriture complete.`;
}

function buildLocalSolutionCode(
  language: string | undefined,
  context: string,
  expectedOutput?: string
) {
  const normalizedLanguage = normalizeLocalLanguage(language);
  const desiredOutput = resolveLocalExpectedOutput(expectedOutput, normalizedLanguage);
  const wantsEquality = /egalit|equal|compare|==|===/i.test(context);

  if (wantsEquality) {
    switch (normalizedLanguage) {
      case "python":
        return `a = 5\nb = 5\n\nif a == b:\n    print("${escapeCodeString(desiredOutput)}")`;
      case "java":
        return `public class Main {\n  public static void main(String[] args) {\n    int a = 5;\n    int b = 5;\n\n    if (a == b) {\n      System.out.println("${escapeCodeString(desiredOutput)}");\n    }\n  }\n}`;
      case "c":
        return `#include <stdio.h>\n\nint main(void) {\n  int a = 5;\n  int b = 5;\n\n  if (a == b) {\n    printf("${escapeCodeString(desiredOutput)}\\n");\n  }\n\n  return 0;\n}`;
      case "cpp":
        return `#include <iostream>\n\nint main() {\n  int a = 5;\n  int b = 5;\n\n  if (a == b) {\n    std::cout << "${escapeCodeString(desiredOutput)}" << std::endl;\n  }\n\n  return 0;\n}`;
      case "csharp":
        return `using System;\n\nclass Program {\n  static void Main() {\n    int a = 5;\n    int b = 5;\n\n    if (a == b) {\n      Console.WriteLine("${escapeCodeString(desiredOutput)}");\n    }\n  }\n}`;
      case "javascript":
        return `const a = 5;\nconst b = 5;\n\nif (a === b) {\n  console.log("${escapeCodeString(desiredOutput)}");\n}`;
      default:
        break;
    }
  }

  switch (normalizedLanguage) {
    case "python":
      return `print("${escapeCodeString(desiredOutput)}")`;
    case "java":
      return `public class Main {\n  public static void main(String[] args) {\n    System.out.println("${escapeCodeString(desiredOutput)}");\n  }\n}`;
    case "c":
      return `#include <stdio.h>\n\nint main(void) {\n  printf("${escapeCodeString(desiredOutput)}\\n");\n  return 0;\n}`;
    case "cpp":
      return `#include <iostream>\n\nint main() {\n  std::cout << "${escapeCodeString(desiredOutput)}" << std::endl;\n  return 0;\n}`;
    case "csharp":
      return `using System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine("${escapeCodeString(desiredOutput)}");\n  }\n}`;
    case "javascript":
      return `console.log("${escapeCodeString(desiredOutput)}");`;
    case "sql":
      return `SELECT '${escapeSqlString(desiredOutput)}' AS resultat;`;
    case "html":
      return `<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Apercu</title>\n  </head>\n  <body>\n    <p>${escapeHtml(desiredOutput)}</p>\n  </body>\n</html>`;
    case "css":
      return `body {\n  font-family: ${"\"Manrope\", sans-serif"};\n  padding: 24px;\n  color: #0f172a;\n}\n\n.resultat {\n  color: #0ea5a4;\n  font-weight: 700;\n}`;
    default:
      return desiredOutput;
  }
}

function detectLikelyExerciseOption(question?: string, options?: string[]) {
  const normalized = normalizeIntentText(`${question ?? ""} ${(options ?? []).join(" ")}`);
  const choices = options ?? [];

  if (/egalit|equal|compare/.test(normalized)) {
    if (choices.some((choice) => choice.trim() === "===") && /strict|type/.test(normalized)) {
      return "===";
    }
    if (choices.some((choice) => choice.trim() === "==")) {
      return "==";
    }
  }

  if (/affect|assign/.test(normalized) && choices.some((choice) => choice.trim() === "=")) {
    return "=";
  }

  return "";
}

function detectLocalTopic(...values: Array<string | null | undefined>) {
  const text = normalizeIntentText(values.filter(Boolean).join(" "));

  if (/(operateur|operator|egalit|comparison|arithmet|logique)/.test(text)) {
    return "operators";
  }
  if (/(condition|if|switch|case|elif|else)/.test(text)) {
    return "conditions";
  }
  if (/(boucle|loop|for|while|iteration)/.test(text)) {
    return "loops";
  }
  if (/(html|balise|formulaire|semant)/.test(text)) {
    return "html";
  }
  if (/(css|flex|grid|selecteur|style)/.test(text)) {
    return "css";
  }
  if (/(javascript|dom|event|async|fetch|json)/.test(text)) {
    return "javascript";
  }
  return "generic";
}

function normalizeLocalLanguage(language?: string) {
  const normalized = normalizeIntentText(language ?? "");
  if (normalized === "js") {
    return "javascript";
  }
  if (normalized === "mysql") {
    return "sql";
  }
  if (normalized === "c#") {
    return "csharp";
  }
  if (normalized === "c++") {
    return "cpp";
  }
  return normalized || "java";
}

function toCodeFenceLanguage(language?: string) {
  return normalizeLocalLanguage(language);
}

function humanLanguage(language?: string) {
  switch (normalizeLocalLanguage(language)) {
    case "python":
      return "Python";
    case "java":
      return "Java";
    case "c":
      return "C";
    case "cpp":
      return "C++";
    case "csharp":
      return "C#";
    case "sql":
      return "SQL";
    case "html":
      return "HTML";
    case "css":
      return "CSS";
    case "javascript":
      return "JavaScript";
    default:
      return "ce langage";
  }
}

function resolveLocalExpectedOutput(expectedOutput: string | undefined, language: string) {
  const firstLine = firstLocalLine(expectedOutput ?? "");
  if (firstLine) {
    return firstLine;
  }

  switch (language) {
    case "python":
      return "Hello, Python!";
    case "java":
      return "Hello, Java!";
    case "c":
      return "Hello, C!";
    case "cpp":
      return "Hello, C++!";
    case "csharp":
      return "Hello, C#!";
    case "sql":
      return "Hello, SQL!";
    case "html":
      return "Hello, HTML!";
    case "javascript":
      return "Hello, JavaScript!";
    default:
      return "Resultat OK";
  }
}

function looksLikeAssignmentInCondition(code: string, language?: string) {
  const normalizedLanguage = normalizeLocalLanguage(language);
  const source = code ?? "";

  if (normalizedLanguage === "python") {
    return /if\s+[^\n]*\b[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^=]/s.test(source);
  }

  if (["c", "cpp", "java", "csharp", "javascript"].includes(normalizedLanguage)) {
    return /if\s*\([^\)]*\b[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^=]/s.test(source);
  }

  return false;
}

function firstLocalLine(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? "";
}

function compactLocal(value: string, maxLength: number) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }
  return `${compact.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function firstNonEmptyLocal(...values: Array<string | null | undefined>) {
  return values.find((value) => Boolean(value?.trim()))?.trim() ?? "";
}

function joinLocalContext(...values: Array<string | null | undefined>) {
  return values.filter((value) => Boolean(value?.trim())).join(" ");
}

function markdownCodeFence(language: string, code: string) {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}

function escapeCodeString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeSqlString(value: string) {
  return value.replace(/'/g, "''");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
