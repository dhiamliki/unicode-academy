import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Shield, Trash2, Users } from "lucide-react";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserRole,
  type AdminUserDto,
} from "../api/adminUsers";
import { getCurrentUser } from "../api/users";
import { getErrorMessage } from "../utils/errorMessage";
import { useToast } from "../components/ToastProvider";

type RoleFilter = "ALL" | "ADMIN" | "USER";

export default function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AdminUserDto | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const me = await getCurrentUser();
        const admin = (me.role ?? "").toUpperCase() === "ADMIN";

        if (!admin) {
          if (!cancelled) {
            setIsAdmin(false);
            setUsers([]);
          }
          return;
        }

        const data = await getAdminUsers();
        if (!cancelled) {
          setIsAdmin(true);
          setUsers(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load admin users"));
          setUsers([]);
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      if (!matchesRole) return false;
      if (!query) return true;
      return (
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery, roleFilter]);

  const userCounts = useMemo(() => {
    const adminCount = users.filter((user) => user.role === "ADMIN").length;
    return {
      total: users.length,
      admins: adminCount,
      regular: users.length - adminCount,
    };
  }, [users]);

  async function refreshUsers() {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to refresh users"));
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRole(user: AdminUserDto) {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setUpdatingUserId(user.id);
    setError(null);

    try {
      const updated = await updateAdminUserRole(user.id, nextRole);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
      showToast({
        type: "success",
        message: `${updated.username} is now ${updated.role}.`,
      });
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Role update failed");
      setError(message);
      showToast({ type: "error", message });
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteCandidate) return;

    setDeletingUserId(deleteCandidate.id);
    setError(null);

    try {
      await deleteAdminUser(deleteCandidate.id);
      setUsers((prev) => prev.filter((user) => user.id !== deleteCandidate.id));
      showToast({
        type: "success",
        message: `${deleteCandidate.username} was deleted.`,
      });
      setDeleteCandidate(null);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Delete failed");
      setError(message);
      showToast({ type: "error", message });
    } finally {
      setDeletingUserId(null);
    }
  }

  if (loading && isAdmin === null) {
    return <p className="text-sm text-[var(--color-text-muted)]">Loading admin workspace...</p>;
  }

  if (!loading && !isAdmin) {
    return (
      <section className="panel max-w-2xl p-6">
        <h2 className="text-xl font-semibold text-slate-900">Admin Access Required</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your account does not have permission to open this page.
        </p>
        <Link to="/dashboard" className="btn-primary mt-5">
          Go to dashboard
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-dark)]">
              Administration
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">User Management</h2>
            <p className="mt-1 text-sm text-slate-600">
              Manage registered accounts, roles, and access.
            </p>
          </div>
          <button type="button" onClick={refreshUsers} className="btn-secondary gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Total users</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-slate-900">
              <Users className="h-4 w-4 text-[var(--color-primary-dark)]" />
              {userCounts.total}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Admins</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-slate-900">
              <Shield className="h-4 w-4 text-[var(--color-primary-dark)]" />
              {userCounts.admins}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Regular users</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{userCounts.regular}</p>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Search users
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="field"
              placeholder="Search by username or email"
            />
          </label>

          <label className="flex w-full max-w-[220px] flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Role filter
            </span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
              className="field bg-white"
            >
              <option value="ALL">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-semibold">ID</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-semibold">Username</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-semibold">Email</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-semibold">Role</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-semibold">Created</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isBusy = updatingUserId === user.id || deletingUserId === user.id;
                return (
                  <tr key={user.id} className="text-sm">
                    <td className="border-b border-[var(--color-border)] px-3 py-3 text-slate-600">{user.id}</td>
                    <td className="border-b border-[var(--color-border)] px-3 py-3 font-medium text-slate-900">
                      {user.username}
                    </td>
                    <td className="border-b border-[var(--color-border)] px-3 py-3 text-slate-700">{user.email}</td>
                    <td className="border-b border-[var(--color-border)] px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="border-b border-[var(--color-border)] px-3 py-3 text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="border-b border-[var(--color-border)] px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(user)}
                          className="btn-secondary px-3 py-1.5 text-xs"
                          disabled={isBusy}
                        >
                          {updatingUserId === user.id
                            ? "Saving..."
                            : user.role === "ADMIN"
                              ? "Demote"
                              : "Promote"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(user)}
                          className="btn-danger gap-1.5 px-3 py-1.5 text-xs"
                          disabled={isBusy}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers.length === 0 && (
          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-slate-50 p-5 text-sm text-slate-600">
            No users found for the selected filter.
          </div>
        )}
      </section>

      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.25)]">
            <h3 className="text-lg font-semibold text-slate-900">Delete User</h3>
            <p className="mt-2 text-sm text-slate-600">
              Delete <span className="font-semibold text-slate-900">{deleteCandidate.username}</span>?
              This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="btn-secondary"
                disabled={deletingUserId === deleteCandidate.id}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn-danger"
                disabled={deletingUserId === deleteCandidate.id}
              >
                {deletingUserId === deleteCandidate.id ? "Deleting..." : "Delete user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}
