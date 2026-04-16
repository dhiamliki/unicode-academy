import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ChatWidget from "./ChatWidget";
import LanguageIcon from "./LanguageIcon";
import { getMyLessonProgress, type LessonProgressDto } from "../api/http";
import { getProgressSummary } from "../api/progress";
import { getCurrentUser } from "../api/users";
import { endAuthenticatedSession } from "../auth/authState";
import { computeStreak, countTodayCompleted, getInitials } from "../lib/academy";
import { queryKeys } from "../lib/queryKeys";
import { getRecentLessons } from "../utils/recentLessons";

type AppShellProps = {
  children: ReactNode;
};

type SearchResult = {
  id: string;
  title: string;
  meta: string;
  to: string;
};

type Breadcrumb = {
  label: string;
  current?: boolean;
};

type ResumeTarget = {
  title: string;
  subtitle: string;
  to: string;
  languageCode: string;
};

const navigationItems = [
  { label: "Accueil", to: "/accueil", icon: "\u2302", end: true, meta: "Navigation" },
  { label: "Apprendre", to: "/apprendre", icon: "\u25CE", end: false, meta: "Navigation" },
] as const;

const accountItems = [
  { label: "Profil", to: "/profil", icon: "\uD83D\uDC64", end: false, meta: "Compte" },
  { label: "Parametres", to: "/parametres", icon: "\u2699", end: false, meta: "Compte" },
] as const;

const utilityItems = [
  { label: "Chat", to: "/chat", meta: "Secondaire" },
  { label: "Classement", to: "/classement", meta: "Secondaire" },
] as const;

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  const progressQuery = useQuery({
    queryKey: queryKeys.progress,
    queryFn: getProgressSummary,
  });

  const lessonProgressQuery = useQuery({
    queryKey: queryKeys.lessonProgress,
    queryFn: getMyLessonProgress,
  });

  useEffect(() => {
    function openSearch() {
      setSearchValue("");
      setSearchOpen(true);
      setAccountMenuOpen(false);
    }

    function closeSearch() {
      setSearchOpen(false);
      setSearchValue("");
    }

    function handleKey(event: KeyboardEvent) {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
        openSearch();
      }

      if (event.key === "Escape") {
        closeSearch();
        setAccountMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [searchOpen]);
  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        event.target instanceof Node &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [accountMenuOpen]);

  const currentUser = currentUserQuery.data;
  const resolvedAvatarUrl = resolveAvatarUrl(currentUser?.avatarUrl);
  const progressSummary = progressQuery.data;
  const lessonProgress = useMemo(
    () => ((lessonProgressQuery.data?.data ?? []) as LessonProgressDto[]),
    [lessonProgressQuery.data?.data]
  );
  const recentLessons = getRecentLessons();

  const isAdmin = (currentUser?.role ?? "").toUpperCase() === "ADMIN";
  const streak = lessonProgress.length > 0 ? computeStreak(lessonProgress) : 0;
  const completedToday = lessonProgress.length > 0 ? countTodayCompleted(lessonProgress) : 0;
  const courseCount = progressSummary?.courses.length ?? 0;
  const completedLessons = progressSummary?.totals.completedLessons ?? 0;
  const completedExercises = progressSummary?.totals.correctExercises ?? 0;
  const activeCourseCount = (progressSummary?.courses ?? []).filter(
    (course) => course.percentage > 0 && course.percentage < 100
  ).length;
  const preferredLanguage = resolvePreferredLanguage(currentUser);
  const breadcrumb = useMemo(() => buildBreadcrumbs(location.pathname), [location.pathname]);
  const resumeTarget = useMemo(() => buildResumeTarget(recentLessons), [recentLessons]);
  const lastActivityLabel = useMemo(() => formatLastActivity(lessonProgress), [lessonProgress]);
  const showChatWidget = !location.pathname.startsWith("/chat");
  const sidebarCopy = useMemo(
    () => buildSidebarCopy(completedToday, lastActivityLabel, streak),
    [completedToday, lastActivityLabel, streak]
  );

  const searchResults = useMemo(() => {
    const baseResults: SearchResult[] = [
      ...navigationItems.map((item) => ({
        id: item.to,
        title: item.label,
        meta: item.meta,
        to: item.to,
      })),
      ...accountItems.map((item) => ({
        id: item.to,
        title: item.label,
        meta: item.meta,
        to: item.to,
      })),
      ...utilityItems.map((item) => ({
        id: item.to,
        title: item.label,
        meta: item.meta,
        to: item.to,
      })),
      ...(resumeTarget
        ? [
            {
              id: `${resumeTarget.to}-resume`,
              title: "Reprendre",
              meta: resumeTarget.title,
              to: resumeTarget.to,
            },
          ]
        : []),
      ...(isAdmin
        ? [{ id: "/admin", title: "Administration", meta: "Admin", to: "/admin" }]
        : []),
    ];

    const normalized = searchValue.trim().toLowerCase();
    if (!normalized) {
      return baseResults;
    }

    return baseResults.filter((item) =>
      `${item.title} ${item.meta}`.toLowerCase().includes(normalized)
    );
  }, [isAdmin, resumeTarget, searchValue]);

  function handleMenuNavigate(to: string) {
    setAccountMenuOpen(false);
    navigate(to);
  }

  function openSearch() {
    setSearchValue("");
    setSearchOpen(true);
    setAccountMenuOpen(false);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchValue("");
  }

  function handleLogout() {
    setAccountMenuOpen(false);
    endAuthenticatedSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="shell">
      <aside className="app-sidebar" aria-label="Navigation principale">
        <Link to="/accueil" className="sidebar-brand" aria-label="UniCode Academy">
          <span className="sidebar-logo">U</span>
          <span className="sidebar-wordmark">
            <span>Uni</span>
            <span>Code</span>
          </span>
        </Link>

        <div className="sidebar-body">
          <section className="sidebar-panel sidebar-panel-progress">
            <div className="sidebar-panel-head">
              <span className="sidebar-panel-title">Progression</span>
              <span className="sidebar-mini-chip">{`${completedToday} ajd`}</span>
            </div>

            <div className="sidebar-panel-metrics">
              <div className="sidebar-panel-metric">
                <strong>{completedLessons}</strong>
                <span>lecons</span>
              </div>
              <div className="sidebar-panel-metric">
                <strong>{completedExercises}</strong>
                <span>exercices</span>
              </div>
            </div>

            <p className="sidebar-panel-copy">{sidebarCopy}</p>

            <div className="sidebar-meta-pills">
              <span className="sidebar-meta-pill">
                {preferredLanguage ?? `${activeCourseCount} parcours actifs`}
              </span>
              <span className="sidebar-meta-pill">
                {courseCount > 0 ? `${courseCount} parcours suivis` : "Aucun parcours"}
              </span>
            </div>
          </section>

          <div className="sidebar-section">
            <div className="sidebar-label">Navigation</div>
            <nav className="sidebar-nav">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.to === "/apprendre" ? (
                    <span className="sidebar-link-badge">{courseCount}</span>
                  ) : null}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Compte</div>
            <nav className="sidebar-nav">
              {accountItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Outils</div>
            <nav className="sidebar-nav">
              {utilityItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/chat"}
                  className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                >
                  <span aria-hidden="true">{item.to === "/chat" ? "\u25A1" : "\u2605"}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {isAdmin ? (
            <div className="sidebar-section">
              <div className="sidebar-label">Admin</div>
              <nav className="sidebar-nav">
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                >
                  <span aria-hidden="true">{`\u25C6`}</span>
                  <span>Administration</span>
                </NavLink>
              </nav>
            </div>
          ) : null}

          <section className="sidebar-panel sidebar-panel-resume">
            <div className="sidebar-panel-head">
              <span className="sidebar-panel-title">Reprendre</span>
              <span className="sidebar-mini-chip accent">
                {resumeTarget ? "Derniere" : "Parcours"}
              </span>
            </div>

            <Link to={resumeTarget?.to ?? "/apprendre"} className="sidebar-resume-card">
              <span className="sidebar-resume-icon" aria-hidden="true">
                <LanguageIcon code={resumeTarget?.languageCode} size={20} />
              </span>
              <span className="sidebar-resume-copy">
                <strong>{resumeTarget?.title ?? "Choisir un parcours"}</strong>
                <span>
                  {resumeTarget?.subtitle ??
                    "Retrouve ton prochain point d'entree depuis la carte des parcours."}
                </span>
              </span>
            </Link>
          </section>

          <div className="sidebar-spacer" />

          <section className="sidebar-help-card">
            <p className="sidebar-help-title">Recherche rapide</p>
            <p className="sidebar-help-copy">
              Utilise Ctrl + K pour retrouver une page ou revenir directement sur ton point de reprise.
            </p>
            <Link to="/apprendre" className="sidebar-help-link">
              Ouvrir les parcours
            </Link>
          </section>

          <Link to="/profil" className="sidebar-user">
            <span className="sidebar-user-avatar">{getInitials(currentUser?.username ?? "U")}</span>
            <span className="sidebar-user-copy">
              <span className="sidebar-user-name">{currentUser?.username ?? "Chargement"}</span>
              <span className="sidebar-user-role">{preferredLanguage ?? formatRoleLabel(currentUser?.role)}</span>
            </span>
            <span className="sidebar-user-dots" aria-hidden="true">
              {`\u22EF`}
            </span>
          </Link>
        </div>
      </aside>

      <div className="shell-main">
        <header className="app-topbar">
          <div className="topbar-breadcrumb">
            {breadcrumb.map((item, index) => (
              <span
                key={`${item.label}-${index}`}
                className={item.current ? "breadcrumb-current" : undefined}
              >
                {index > 0 ? "\u203A " : ""}
                {item.label}
              </span>
            ))}
          </div>

          <button type="button" className="topbar-search" onClick={openSearch}>
            <span aria-hidden="true">{`\uD83D\uDD0D`}</span>
            <span className="topbar-search-label">Rechercher...</span>
            <span className="topbar-search-kbd">Ctrl K</span>
          </button>

          <div className="topbar-actions">
            <div className="topbar-stats" aria-label="Statistiques rapides">
              <span className="topbar-stat">{`Aujourd'hui ${completedToday}`}</span>
              <span className="topbar-stat">{`Lecons ${completedLessons}`}</span>
            </div>

            <div className="account-menu" ref={accountMenuRef}>
              <button
                type="button"
                className={`account-menu-trigger${accountMenuOpen ? " is-open" : ""}`}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                onClick={() => setAccountMenuOpen((current) => !current)}
              >
                <span className="account-menu-avatar">
                  {currentUser?.avatarUrl ? (
                    <img src={resolvedAvatarUrl} alt="" className="account-menu-avatar-image" />
                  ) : (
                    getInitials(currentUser?.username ?? "U")
                  )}
                </span>
                <span className="account-menu-copy">
                  <span className="account-menu-name">{currentUser?.username ?? "Compte"}</span>
                  <span className="account-menu-role">
                    {preferredLanguage ?? formatRoleLabel(currentUser?.role)}
                  </span>
                </span>
                <span className="account-menu-caret" aria-hidden="true">
                  {`\u25BE`}
                </span>
              </button>

              {accountMenuOpen ? (
                <div className="account-menu-popover" role="menu" aria-label="Menu du compte">
                  <div className="account-menu-summary">
                    <span className="account-menu-summary-avatar">
                      {getInitials(currentUser?.username ?? "U")}
                    </span>
                    <div className="account-menu-summary-copy">
                      <strong>{currentUser?.username ?? "Compte"}</strong>
                      <span>{formatRoleLabel(currentUser?.role)}</span>
                    </div>
                    {preferredLanguage ? (
                      <span className="account-menu-badge">{preferredLanguage}</span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="account-menu-item"
                    role="menuitem"
                    onClick={() => handleMenuNavigate("/profil")}
                  >
                    <span aria-hidden="true">{`\uD83D\uDC64`}</span>
                    <span>Profil</span>
                  </button>

                  <button
                    type="button"
                    className="account-menu-item"
                    role="menuitem"
                    onClick={() => handleMenuNavigate("/parametres")}
                  >
                    <span aria-hidden="true">{`\u2699`}</span>
                    <span>Parametres</span>
                  </button>

                  <button
                    type="button"
                    className="account-menu-item danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <span aria-hidden="true">{`\u21AA`}</span>
                    <span>Deconnexion</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="shell-content">{children}</main>
      </div>

      {searchOpen ? (
        <div className="search-overlay" onClick={closeSearch}>
          <div className="search-panel" onClick={(event) => event.stopPropagation()}>
            <div className="search-input-row">
              <span aria-hidden="true">{`\uD83D\uDD0D`}</span>
              <input
                ref={searchInputRef}
                className="search-input"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Rechercher une page..."
              />
            </div>

            <div className="search-results">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    className="search-result"
                    onClick={() => {
                      closeSearch();
                      navigate(result.to);
                    }}
                  >
                    <span className="search-result-title">{result.title}</span>
                    <span className="search-result-meta">{result.meta}</span>
                  </button>
                ))
              ) : (
                <div className="search-empty">Aucun resultat pour cette recherche.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showChatWidget ? <ChatWidget /> : null}
    </div>
  );
}

function buildBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0 || segments[0] === "accueil") {
    return [{ label: "Accueil", current: true }];
  }

  if (segments[0] === "apprendre") {
    if (!segments[1]) {
      return [{ label: "Apprendre" }, { label: "Parcours", current: true }];
    }

    return [{ label: "Apprendre" }, { label: `Cours ${segments[1]}`, current: true }];
  }

  if (segments[0] === "classement") {
    return [{ label: "Classement", current: true }];
  }

  if (segments[0] === "chat") {
    return [{ label: "Discussion" }, { label: "Chat", current: true }];
  }

  if (segments[0] === "profil") {
    return [{ label: "Profil", current: true }];
  }

  if (segments[0] === "parametres") {
    return [{ label: "Parametres", current: true }];
  }

  if (segments[0] === "admin") {
    return [{ label: "Admin" }, { label: "Panel", current: true }];
  }

  return [{ label: "UniCode", current: true }];
}

function buildResumeTarget(
  recentLessons: ReturnType<typeof getRecentLessons>
): ResumeTarget | null {
  const lesson = recentLessons[0];
  if (!lesson) {
    return null;
  }

  return {
    title: lesson.lessonTitle,
    subtitle: lesson.courseTitle,
    to: `/apprendre/${lesson.courseId}/${lesson.unitId}/${lesson.lessonId}`,
    languageCode: lesson.languageCode,
  };
}

function buildSidebarCopy(completedToday: number, lastActivityLabel: string, streak: number) {
  if (completedToday > 0) {
    return `${completedToday} lecon${completedToday > 1 ? "s" : ""} validee${completedToday > 1 ? "s" : ""} aujourd'hui.`;
  }

  if (streak > 0) {
    return `Serie reelle de ${streak} jour${streak > 1 ? "s" : ""}. Derniere activite ${lastActivityLabel.toLowerCase()}.`;
  }

  if (lastActivityLabel !== "Aucune activite") {
    return `Derniere activite ${lastActivityLabel.toLowerCase()}. Reprends une lecon pour relancer le rythme.`;
  }

  return "Commence une premiere lecon pour lancer ta progression visible ici.";
}

function resolvePreferredLanguage(
  currentUser: Awaited<ReturnType<typeof getCurrentUser>> | undefined
) {
  const preferredName = currentUser?.preferredLanguageName?.trim();
  if (preferredName) {
    return preferredName;
  }

  const preferredCode = currentUser?.preferredLanguageCode?.trim();
  return preferredCode ? preferredCode.toUpperCase() : null;
}

function formatRoleLabel(role: string | undefined) {
  return (role ?? "").toUpperCase() === "ADMIN" ? "Administrateur" : "Etudiant";
}

function resolveAvatarUrl(avatarUrl: string | null | undefined) {
  if (!avatarUrl) {
    return "";
  }
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  if (avatarUrl.startsWith("/")) {
    return `${apiBaseUrl}${avatarUrl}`;
  }
  return `${apiBaseUrl}/${avatarUrl}`;
}

function formatLastActivity(progressItems: LessonProgressDto[]) {
  const latestTimestamp = progressItems.reduce<number | null>((latest, item) => {
    if (item.status !== "COMPLETED" || !item.completedAt) {
      return latest;
    }

    const timestamp = new Date(item.completedAt).getTime();
    if (Number.isNaN(timestamp)) {
      return latest;
    }

    if (latest === null || timestamp > latest) {
      return timestamp;
    }

    return latest;
  }, null);

  if (latestTimestamp === null) {
    return "Aucune activite";
  }

  return formatDateDistance(new Date(latestTimestamp));
}

function formatDateDistance(date: Date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays <= 0) {
    return "Aujourd'hui";
  }

  if (diffDays === 1) {
    return "Hier";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}
