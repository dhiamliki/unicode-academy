export type WebLanguage = "html" | "css" | "javascript";

const WEB_LANGUAGES = new Set<WebLanguage>(["html", "css", "javascript"]);

const DEFAULT_WEB_SHELLS: Record<WebLanguage, string> = {
  html: `<!DOCTYPE html>
<html>
<head>
  <title>Defi UniCode</title>
</head>
<body>
  <section>
    <h1>Previsualisation</h1>
    <p>Ton rendu apparaitra ici apres execution.</p>
  </section>
</body>
</html>`,
  css: `<!DOCTYPE html>
<html>
<head>
  <title>Defi UniCode</title>
  <style>

  </style>
</head>
<body>
  <h1 class="title">Previsualisation</h1>
  <p>Modifie le CSS puis clique sur Executer.</p>
</body>
</html>`,
  javascript: `<!DOCTYPE html>
<html>
<head>
  <title>Defi UniCode</title>
</head>
<body>
  <h1 id="title">Previsualisation</h1>
  <p>Modifie le JavaScript puis clique sur Executer.</p>
  <script>

  </script>
</body>
</html>`,
};

type InsertSnippetParams = {
  currentCode: string;
  snippet: string;
  lessonLanguage: string;
  snippetLanguage: string;
};

export function isWebLanguage(language: string) {
  return WEB_LANGUAGES.has(language as WebLanguage);
}

export function defaultWebShell(language: WebLanguage) {
  return DEFAULT_WEB_SHELLS[language];
}

export function ensureWebLessonCode(language: string, code: string) {
  const normalized = normalizeWebLanguage(language);
  if (!normalized) {
    return code;
  }

  const trimmedCode = code.trim();
  if (!trimmedCode) {
    return defaultWebShell(normalized);
  }

  if (containsHtmlDocument(trimmedCode)) {
    return trimmedCode;
  }

  if (normalized === "html") {
    return insertHtmlIntoBody(defaultWebShell("html"), trimmedCode);
  }

  if (normalized === "css") {
    return insertCssIntoStyle(defaultWebShell("css"), trimmedCode);
  }

  return insertJavaScriptIntoScript(defaultWebShell("javascript"), trimmedCode);
}

export function insertSnippetIntoEditor(params: InsertSnippetParams) {
  const targetWebLanguage = resolveTargetWebLanguage(params.lessonLanguage, params.snippetLanguage);
  const snippet = params.snippet.trim();

  if (!snippet) {
    return params.currentCode;
  }

  if (!targetWebLanguage) {
    return snippet;
  }

  const baseDocument = ensureWebLessonCode(params.lessonLanguage, params.currentCode);

  if (targetWebLanguage === "html") {
    return insertHtmlIntoBody(baseDocument, snippet);
  }

  if (targetWebLanguage === "css") {
    return insertCssIntoStyle(baseDocument, snippet);
  }

  return insertJavaScriptIntoScript(baseDocument, snippet);
}

function resolveTargetWebLanguage(lessonLanguage: string, snippetLanguage: string) {
  const normalizedSnippetLanguage = normalizeWebLanguage(snippetLanguage);
  if (normalizedSnippetLanguage) {
    return normalizedSnippetLanguage;
  }
  return normalizeWebLanguage(lessonLanguage);
}

function normalizeWebLanguage(language: string) {
  if (!language) return null;
  const normalized = language.trim().toLowerCase();
  if (normalized === "html") return "html";
  if (normalized === "css") return "css";
  if (normalized === "js" || normalized === "javascript") return "javascript";
  return null;
}

function containsHtmlDocument(code: string) {
  return /<!doctype html|<html[\s>]/i.test(code);
}

function insertHtmlIntoBody(document: string, snippet: string) {
  if (/<\/body>/i.test(document)) {
    return document.replace(/<\/body>/i, `${withPaddedSnippet(snippet)}</body>`);
  }
  return `${document}\n${snippet}\n`;
}

function insertCssIntoStyle(document: string, snippet: string) {
  const safeSnippet = snippet.replace(/<\/style>/gi, "<\\/style>");

  if (/<\/style>/i.test(document)) {
    return document.replace(/<\/style>/i, `${withPaddedSnippet(safeSnippet)}</style>`);
  }

  if (/<\/head>/i.test(document)) {
    return document.replace(
      /<\/head>/i,
      `  <style>${withPaddedSnippet(safeSnippet)}  </style>\n</head>`
    );
  }

  return `${document}\n<style>${withPaddedSnippet(safeSnippet)}</style>\n`;
}

function insertJavaScriptIntoScript(document: string, snippet: string) {
  const safeSnippet = snippet.replace(/<\/script>/gi, "<\\/script>");

  if (/<\/script>/i.test(document)) {
    return document.replace(/<\/script>/i, `${withPaddedSnippet(safeSnippet)}</script>`);
  }

  if (/<\/body>/i.test(document)) {
    return document.replace(
      /<\/body>/i,
      `  <script>${withPaddedSnippet(safeSnippet)}  </script>\n</body>`
    );
  }

  return `${document}\n<script>${withPaddedSnippet(safeSnippet)}</script>\n`;
}

function withPaddedSnippet(snippet: string) {
  return `\n${snippet}\n\n`;
}
