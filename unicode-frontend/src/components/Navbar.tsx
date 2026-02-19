import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuth } from "../auth/session";
import { useNotifications } from "../notifications/NotificationsContext";

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
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
  const hasSelected = selectedIds.length > 0;

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  function goAccount() {
    setProfileOpen(false);
    nav("/account");
  }

  function goProfile() {
    setProfileOpen(false);
    nav("/profile");
  }

  function goLeaderboard() {
    setProfileOpen(false);
    nav("/leaderboard");
  }

  function logout() {
    clearAuth();
    setProfileOpen(false);
    nav("/login", { replace: true });
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <Link
        to="/courses"
        style={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}
      >
        Unicode
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={notifOpen}
            aria-label="Notifications"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            style={{
              border: "1px solid #ddd",
              background: "white",
              borderRadius: 8,
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 18,
              position: "relative",
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: 10,
                  background: "#b91c1c",
                  color: "white",
                  fontSize: 11,
                  lineHeight: "18px",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 320,
                maxHeight: 360,
                overflow: "auto",
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                padding: 8,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                <span>Notifications</span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  {notifications.length}
                </span>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: 12, color: "#6b7280" }}>
                  Aucune notification.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "18px 1fr auto",
                        gap: 8,
                        alignItems: "start",
                        padding: "8px 6px",
                        borderRadius: 6,
                        background: n.read ? "transparent" : "#f8fafc",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={n.selected}
                        onChange={() => toggleSelected(n.id)}
                        style={{ marginTop: 2 }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleRead(n.id)}
                        style={{
                          textAlign: "left",
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontWeight: n.read ? 400 : 600,
                          }}
                        >
                          {!n.read && (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#2563eb",
                                display: "inline-block",
                              }}
                            />
                          )}
                          <span>{n.message}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {formatTime(n.createdAt)}
                        </div>
                      </button>
                      <button
                        type="button"
                        title="Supprimer"
                        onClick={() => deleteMany([n.id])}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: 2,
                          color: "#6b7280",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                <button type="button" onClick={markAllRead} style={panelButton}>
                  Mark all as read
                </button>
                <button type="button" onClick={clearAll} style={panelButton}>
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => deleteMany(selectedIds)}
                  disabled={!hasSelected}
                  style={{
                    ...panelButton,
                    opacity: hasSelected ? 1 : 0.5,
                    cursor: hasSelected ? "pointer" : "not-allowed",
                  }}
                >
                  Delete selected
                </button>
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            aria-label="Profile menu"
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            style={{
              border: "1px solid #ddd",
              background: "white",
              borderRadius: 8,
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            👤
          </button>

          {profileOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 180,
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                padding: 6,
                zIndex: 10,
              }}
            >
              <button
                role="menuitem"
                type="button"
                onClick={goProfile}
                style={menuButtonStyle}
              >
                Profile
              </button>
              <button
                role="menuitem"
                type="button"
                onClick={goLeaderboard}
                style={menuButtonStyle}
              >
                Leaderboard
              </button>
              <button
                role="menuitem"
                type="button"
                onClick={goAccount}
                style={menuButtonStyle}
              >
                Mon compte
              </button>
              <button
                role="menuitem"
                type="button"
                onClick={logout}
                style={menuButtonStyle}
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const menuButtonStyle: CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "8px 10px",
  background: "transparent",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const panelButton: CSSProperties = {
  border: "1px solid #ddd",
  background: "white",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 12,
};

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

