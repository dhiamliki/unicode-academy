export type SupportedLanguageCode =
  | "c"
  | "java"
  | "python"
  | "cpp"
  | "mysql"
  | "csharp"
  | "dotnet"
  | "html"
  | "css"
  | "js";

export type LanguageVisual = {
  code: SupportedLanguageCode;
  label: string;
};

export const languageVisuals: LanguageVisual[] = [
  { code: "c", label: "C" },
  { code: "java", label: "Java" },
  { code: "python", label: "Python" },
  { code: "cpp", label: "C++" },
  { code: "mysql", label: "MySQL" },
  { code: "csharp", label: "C#" },
  { code: "dotnet", label: ".NET" },
  { code: "html", label: "HTML5" },
  { code: "css", label: "CSS3" },
  { code: "js", label: "JavaScript" },
];

const visualsByCode = new Map(languageVisuals.map((item) => [item.code, item]));

const aliasByCode: Record<string, SupportedLanguageCode> = {
  c: "c",
  java: "java",
  python: "python",
  py: "python",
  cpp: "cpp",
  "c++": "cpp",
  cplusplus: "cpp",
  mysql: "mysql",
  sql: "mysql",
  csharp: "csharp",
  cs: "csharp",
  "c#": "csharp",
  dotnet: "dotnet",
  ".net": "dotnet",
  net: "dotnet",
  html: "html",
  html5: "html",
  css: "css",
  css3: "css",
  js: "js",
  javascript: "js",
};

const legacyIconAliases = new Map<string, SupportedLanguageCode>([
  ["🐍", "python"],
  ["☕", "java"],
  ["✨", "js"],
  ["🧱", "html"],
  ["🎨", "css"],
  ["⚙️", "c"],
  ["🧠", "cpp"],
  ["💠", "csharp"],
  ["🗃️", "mysql"],
  ["💻", "dotnet"],
]);

export function normalizeLanguageCode(languageCode?: string | null) {
  return (languageCode ?? "").trim().toLowerCase().replace(/[\s_-]+/g, "");
}

export function resolveLanguageCode(languageCode?: string | null) {
  const normalized = normalizeLanguageCode(languageCode);
  if (!normalized) {
    return null;
  }

  const alias = aliasByCode[normalized];
  if (alias) {
    return alias;
  }

  return visualsByCode.has(normalized as SupportedLanguageCode)
    ? (normalized as SupportedLanguageCode)
    : null;
}

export function resolveLegacyLanguageCode(icon?: string | null) {
  const legacy = (icon ?? "").trim();
  if (!legacy) {
    return null;
  }

  return legacyIconAliases.get(legacy) ?? null;
}

export function getLanguageLabel(languageCode?: string | null) {
  const resolved = resolveLanguageCode(languageCode);
  if (resolved) {
    return visualsByCode.get(resolved)?.label ?? "Code";
  }

  const fallback = (languageCode ?? "").trim();
  if (!fallback) {
    return "Code";
  }

  return fallback.toUpperCase();
}
