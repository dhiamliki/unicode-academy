import { getLanguageLabel, resolveLanguageCode } from "../utils/languageVisuals";

type LanguageIconProps = {
  code?: string | null;
  size?: number;
  className?: string;
  decorative?: boolean;
};

export default function LanguageIcon({
  code,
  size = 20,
  className = "",
  decorative = true,
}: LanguageIconProps) {
  const resolvedCode = resolveLanguageCode(code);
  const label = getLanguageLabel(code);

  return (
    <span
      className={`language-icon${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size }}
      aria-hidden={decorative}
      aria-label={decorative ? undefined : label}
      role={decorative ? undefined : "img"}
    >
      {renderLanguageLogo(resolvedCode ?? "default")}
    </span>
  );
}

function renderLanguageLogo(code: ReturnType<typeof resolveLanguageCode> | "default") {
  switch (code) {
    case "c":
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <path d="M16 3.5 26.5 9.5v13L16 28.5 5.5 22.5v-13Z" fill="#00599C" />
          <text
            x="16"
            y="19"
            fill="#fff"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
          >
            C
          </text>
        </svg>
      );
    case "cpp":
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <path d="M16 3.5 26.5 9.5v13L16 28.5 5.5 22.5v-13Z" fill="#004482" />
          <text
            x="16"
            y="18.5"
            fill="#fff"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="8.2"
            fontWeight="700"
            textAnchor="middle"
          >
            C++
          </text>
        </svg>
      );
    case "csharp":
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <path d="M16 3.5 26.5 9.5v13L16 28.5 5.5 22.5v-13Z" fill="#68217A" />
          <text
            x="16"
            y="18.5"
            fill="#fff"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="8.8"
            fontWeight="700"
            textAnchor="middle"
          >
            C#
          </text>
        </svg>
      );
    case "dotnet":
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <rect x="3.5" y="5" width="25" height="22" rx="6" fill="#512BD4" />
          <text
            x="16"
            y="18.5"
            fill="#fff"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="7.2"
            fontWeight="700"
            textAnchor="middle"
          >
            .NET
          </text>
        </svg>
      );
    case "html":
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <path d="M6 4h20l-1.8 20L16 28 7.8 24Z" fill="#E34F26" />
          <path d="M16 6h8.1l-1.5 16.4L16 24.4Z" fill="#EF652A" />
          <text
            x="16"
            y="19.2"
            fill="#fff"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
          >
            5
          </text>
        </svg>
      );
    case "css":
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <path d="M6 4h20l-1.8 20L16 28 7.8 24Z" fill="#1572B6" />
          <path d="M16 6h8.1l-1.5 16.4L16 24.4Z" fill="#33A9DC" />
          <text
            x="16"
            y="19.2"
            fill="#fff"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
          >
            3
          </text>
        </svg>
      );
    case "js":
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <rect x="4" y="4" width="24" height="24" rx="4" fill="#F7DF1E" />
          <text
            x="16"
            y="20"
            fill="#111827"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="10.8"
            fontWeight="800"
            textAnchor="middle"
          >
            JS
          </text>
        </svg>
      );
    case "python":
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <path
            d="M10 4h8a5 5 0 0 1 5 5v3a3 3 0 0 1-3 3h-8a3 3 0 0 0-3 3v2H8a4 4 0 0 1-4-4v-5a7 7 0 0 1 6-7Z"
            fill="#3776AB"
          />
          <circle cx="18.3" cy="9.1" r="1.1" fill="#fff" />
          <path
            d="M22 28h-8a5 5 0 0 1-5-5v-3a3 3 0 0 1 3-3h8a3 3 0 0 0 3-3v-2h1a4 4 0 0 1 4 4v5a7 7 0 0 1-6 7Z"
            fill="#FFD43B"
          />
          <circle cx="13.7" cy="22.9" r="1.1" fill="#6B4F00" />
          <path d="M16 15v2" stroke="#fff" strokeLinecap="round" strokeWidth="1.7" />
        </svg>
      );
    case "java":
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <path
            d="M13.5 8c2 1.6-1 2.7.8 4.5 1.8 1.8 4 1.5 3.4 4.1"
            fill="none"
            stroke="#EA2D2E"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="M18.2 6.2c1.6 1.3-.7 2.1.6 3.4 1.2 1.2 2.8 1.1 2.4 3"
            fill="none"
            stroke="#EA2D2E"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
          <path
            d="M10.5 13.5h10v5.3c0 2.3-1.8 4.2-4.2 4.2h-1.6a4.2 4.2 0 0 1-4.2-4.2Z"
            fill="none"
            stroke="#0E5AA7"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path
            d="M20.5 15h1.8a2 2 0 0 1 0 4h-1.8"
            fill="none"
            stroke="#0E5AA7"
            strokeLinecap="round"
            strokeWidth="1.9"
          />
          <path d="M9.5 25.2c3.8 1.4 9.2 1.4 13 0" fill="none" stroke="#0E5AA7" strokeLinecap="round" strokeWidth="1.9" />
        </svg>
      );
    case "mysql":
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <path
            d="M5.5 20.6c1.7-4.8 5.9-8.7 11.2-9.8 2.5-.5 5.1-.2 7.6 1-2.7-.1-4.7.8-5.9 2.7 2.8 0 5 .9 6.6 3-2.2-.9-4.5-1-6.6-.2-2.1.8-3.6 2.6-4.2 5-1.4-2.7-3.6-4-6.6-4-1 .8-1.8 1.6-2.1 2.3Z"
            fill="#00618A"
          />
          <path
            d="M22.2 11.2c1.2.1 2.6.5 4 1.2"
            fill="none"
            stroke="#F29111"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <circle cx="18.4" cy="12.5" r="1" fill="#00618A" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" focusable="false">
          <rect x="4" y="4" width="24" height="24" rx="6" fill="#E2E8F0" />
          <path
            d="M12 12 9 16l3 4M20 12l3 4-3 4"
            fill="none"
            stroke="#475569"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      );
  }
}
