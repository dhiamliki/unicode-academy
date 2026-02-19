export type LanguageVisual = {
  code: string;
  label: string;
  image: string;
};

export const languageShortcuts: LanguageVisual[] = [
  { code: "c", label: "C", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
  { code: "java", label: "Java", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { code: "python", label: "Python", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { code: "cpp", label: "C++", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
  { code: "mysql", label: "MySQL", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  { code: "csharp", label: ".NET", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" },
  { code: "html", label: "HTML", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { code: "css", label: "CSS", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { code: "js", label: "JavaScript", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
];

const visualsByCode = new Map(languageShortcuts.map((item) => [item.code, item]));

const aliasByCode: Record<string, string> = {
  c: "c",
  java: "java",
  python: "python",
  cpp: "cpp",
  "c++": "cpp",
  cplusplus: "cpp",
  mysql: "mysql",
  csharp: "csharp",
  "c#": "csharp",
  ".net": "csharp",
  dotnet: "csharp",
  html: "html",
  html5: "html",
  css: "css",
  css3: "css",
  js: "js",
  javascript: "js",
};

function normalizeLanguageCode(languageCode?: string) {
  return (languageCode ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

function resolveLanguageCode(languageCode?: string) {
  const normalized = normalizeLanguageCode(languageCode);
  if (!normalized) return null;
  const alias = aliasByCode[normalized];
  if (alias) return alias;
  return visualsByCode.has(normalized) ? normalized : null;
}

export function getLanguageImage(languageCode?: string) {
  const normalized = resolveLanguageCode(languageCode);
  if (!normalized) return null;
  return visualsByCode.get(normalized)?.image ?? null;
}

export function getLanguageLabel(languageCode?: string) {
  const normalized = resolveLanguageCode(languageCode);
  if (normalized) {
    return visualsByCode.get(normalized)?.label ?? "N/A";
  }

  const fallback = (languageCode ?? "").trim();
  if (!fallback) return "N/A";
  return fallback.toUpperCase();
}

