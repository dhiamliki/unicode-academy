import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpenText,
  ChevronDown,
  Home,
  Languages,
  LogOut,
  Menu,
  Paperclip,
  Search,
  Settings,
  Shield,
  Trophy,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { clearAuth } from "../auth/session";
import { useNotifications } from "../notifications/NotificationsContext";
import { getCurrentUser, type CurrentUserDto } from "../api/users";
import { languageShortcuts } from "../utils/languageVisuals";

const sidebarLinks = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/courses", label: "Courses", icon: BookOpenText },
  { to: "/attachments", label: "Attachments", icon: Paperclip },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const topLinks = [
  { to: "/search", label: "Search" },
  { to: "/courses", label: "Courses" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/profile", label: "Profile" },
];

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserDto | null>(null);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const {
    notifications,
    markAllRead,
    clearAll,
    deleteMany,
    toggleRead,
    toggleSelected,
  } = useNotifications();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const selectedIds = useMemo(
    () => notifications.filter((n) => n.selected).map((n) => n.id),
    [notifications]
  );

  const isAdmin = (currentUser?.role ?? "").toUpperCase() === "ADMIN";

  const navItems = useMemo(
    () =>
      isAdmin
        ? [...sidebarLinks, { to: "/admin/users", label: "Admin", icon: Shield }]
        : sidebarLinks,
    [isAdmin]
  );

  const topNavItems = useMemo(
    () =>
      isAdmin
        ? [...topLinks, { to: "/admin/users", label: "Admin" }]
        : topLinks,
    [isAdmin]
  );

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/dashboard")) return "Dashboard";
    if (location.pathname.startsWith("/search")) return "Search";
    if (location.pathname.startsWith("/courses")) return "Courses";
    if (location.pathname.startsWith("/attachments")) return "Attachments";
    if (location.pathname.startsWith("/lessons")) return "Lesson";
    if (location.pathname.startsWith("/leaderboard")) return "Leaderboard";
    if (location.pathname.startsWith("/profile")) return "Profile";
    if (location.pathname.startsWith("/account")) return "Account";
    if (location.pathname.startsWith("/admin")) return "Admin";
    return "UniCode";
  }, [location.pathname]);

  const activeLanguageFilter = useMemo(
    () => new URLSearchParams(location.search).get("language")?.toLowerCase() ?? "",
    [location.search]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const me = await getCurrentUser();
        if (!cancelled) {
          setCurrentUser(me);
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
        }
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(target)
      ) {
        setSidebarOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotifOpen(false);
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    setProfileOpen(false);
    setNotifOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  function logout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div
        className={`fixed inset-0 z-30 bg-slate-950/45 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-y-auto bg-[var(--color-sidebar-dark)] px-4 py-6 text-slate-300 shadow-[0_20px_38px_rgba(2,6,23,0.5)] transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-semibold text-white">
              U
            </span>
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-100">UniCode</p>
              <p className="text-xs text-slate-400/90">Learning Platform</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={[
                  "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                  isActive
                    ? "bg-[var(--color-sidebar-hover)] text-white"
                    : "text-slate-300 hover:bg-[var(--color-sidebar-hover)] hover:text-slate-100",
                ].join(" ")}
              >
                <span
                  className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full ${
                    isActive ? "bg-[var(--color-primary)]" : "bg-transparent"
                  }`}
                />
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Languages className="h-4 w-4" />
            Language Shortcuts
          </div>
          <div className="space-y-2">
            {languageShortcuts.map((language) => {
              const isSelected =
                location.pathname.startsWith("/courses") &&
                activeLanguageFilter === language.code.toLowerCase();
              return (
                <Link
                  key={language.code}
                  to={`/courses?language=${language.code}`}
                  className={`flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium transition ${
                    isSelected
                      ? "bg-teal-500/15 text-teal-100"
                      : "bg-white/[0.03] text-slate-200 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                      isSelected ? "bg-white/[0.16]" : "bg-white/[0.08]"
                    }`}
                  >
                    <img
                      src={language.image}
                      alt={`${language.label} logo`}
                      loading="lazy"
                      className="h-4 w-4 object-contain"
                    />
                  </span>
                  <span className="truncate">{language.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {isAdmin && (
          <div className="mt-8 rounded-xl border border-teal-400/45 bg-teal-500/[0.11] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-200">
              Admin Workspace
            </p>
            <p className="mt-1 text-xs text-teal-100/90">
              Manage users and upload course attachments.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to="/admin/users" className="btn-primary w-full justify-center gap-1.5 px-3 py-1.5 text-xs">
                <Shield className="h-3.5 w-3.5" />
                Users
              </Link>
              <Link to="/attachments" className="btn-secondary w-full justify-center gap-1.5 px-3 py-1.5 text-xs !border-white/25 !bg-white/[0.08] !text-white hover:!bg-white/[0.12]">
                <Upload className="h-3.5 w-3.5" />
                Files
              </Link>
            </div>
          </div>
        )}

        <div className="mt-auto rounded-xl border border-white/[0.11] bg-white/[0.05] p-3">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="truncate text-sm font-semibold text-slate-100">
            {currentUser?.username ?? "User"}
          </p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-teal-50 hover:text-[var(--color-primary-dark)] lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Workspace</p>
                <h1 className="text-base font-semibold text-[var(--color-text-primary)]">{pageTitle}</h1>
              </div>
            </div>

            <nav className="hidden items-center gap-1 rounded-full border border-[var(--color-border)] bg-white p-1 md:flex">
              {topNavItems.map((link) => {
                const isActive =
                  location.pathname === link.to ||
                  location.pathname.startsWith(`${link.to}/`);
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={[
                      "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                      isActive
                        ? "bg-teal-500/15 text-[var(--color-primary-dark)]"
                        : "text-[var(--color-text-muted)] hover:bg-slate-100 hover:text-[var(--color-text-primary)]",
                    ].join(" ")}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((prev) => !prev);
                    setProfileOpen(false);
                  }}
                  aria-label="Notifications"
                  className="relative rounded-xl border border-[var(--color-border)] bg-white p-2 text-[var(--color-text-muted)] transition hover:bg-slate-50 hover:text-[var(--color-text-primary)]"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-semibold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-12 z-30 w-80 rounded-[14px] border border-[var(--color-border)] bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Notifications</p>
                      <span className="text-xs text-[var(--color-text-muted)]">{notifications.length}</span>
                    </div>

                    {notifications.length === 0 ? (
                      <p className="rounded-lg bg-slate-50 p-3 text-sm text-[var(--color-text-muted)]">
                        No notifications yet.
                      </p>
                    ) : (
                      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`rounded-lg border p-2 ${
                              notification.read
                                ? "border-[var(--color-border)] bg-white"
                                : "border-teal-100 bg-teal-50"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={notification.selected}
                                onChange={() => toggleSelected(notification.id)}
                                className="mt-1 h-4 w-4 rounded border-slate-300"
                              />
                              <button
                                type="button"
                                onClick={() => toggleRead(notification.id)}
                                className="flex-1 text-left"
                              >
                                <p
                                  className={`text-sm ${
                                    notification.read
                                      ? "font-normal text-slate-700"
                                      : "font-semibold text-slate-900"
                                  }`}
                                >
                                  {notification.message}
                                </p>
                                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMany([notification.id])}
                                className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Delete notification"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={markAllRead} className="btn-secondary px-3 py-1.5 text-xs">
                        Mark all read
                      </button>
                      <button type="button" onClick={clearAll} className="btn-secondary px-3 py-1.5 text-xs">
                        Clear all
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMany(selectedIds)}
                        className="btn-secondary px-3 py-1.5 text-xs"
                        disabled={selectedIds.length === 0}
                      >
                        Delete selected
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((prev) => !prev);
                    setNotifOpen(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                    {(currentUser?.username ?? "U").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-24 truncate text-sm font-medium sm:inline">
                    {currentUser?.username ?? "Profile"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-30 w-52 rounded-[14px] border border-[var(--color-border)] bg-white p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <UserRound className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/account"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Settings className="h-4 w-4" />
                      Account
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="h-[calc(100vh-4rem)] overflow-y-auto p-5 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
