import { useEffect, useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { getProgressSummary, type ProgressSummaryDto } from "../api/progress";
import { getCurrentUser, type CurrentUserDto } from "../api/users";

export default function Profile() {
  const [user, setUser] = useState<CurrentUserDto | null>(null);
  const [summary, setSummary] = useState<ProgressSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [me, progressSummary] = await Promise.all([getCurrentUser(), getProgressSummary()]);
        if (!cancelled) {
          setUser(me);
          setSummary(progressSummary);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Failed to load profile";
        if (!cancelled) {
          setError(msg);
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

  const correctRate = useMemo(() => {
    const totals = summary?.totals;
    if (!totals || totals.attemptedExercises === 0) return 0;
    return Math.round((totals.correctExercises * 100) / totals.attemptedExercises);
  }, [summary]);

  return (
    <div className="space-y-6">
      <div className="panel panel-hover p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Profile</h2>
            <p className="text-muted text-sm">Your account and learning performance overview.</p>
          </div>
        </div>
      </div>

      {loading && <p className="text-muted text-sm">Loading profile...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && user && summary && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="panel panel-hover p-5">
            <h3 className="text-lg font-semibold text-slate-900">Account</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-900">Username:</span> {user.username}
              </p>
              <p>
                <span className="font-medium text-slate-900">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium text-slate-900">Role:</span> {user.role}
              </p>
              <p>
                <span className="font-medium text-slate-900">Preferred language:</span>{" "}
                {user.preferredLanguageName
                  ? `${user.preferredLanguageName} (${user.preferredLanguageCode ?? "-"})`
                  : "Not set"}
              </p>
            </div>
          </section>

          <section className="panel panel-hover p-5">
            <h3 className="text-lg font-semibold text-slate-900">Stats</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Metric label="Completed courses" value={summary.totals.completedCourses} />
              <Metric label="Completed lessons" value={summary.totals.completedLessons} />
              <Metric label="Exercise attempts" value={summary.totals.attemptedExercises} />
              <Metric label="Correct exercises" value={summary.totals.correctExercises} />
            </div>

            <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3">
              <p className="text-xs uppercase tracking-wide text-teal-600">Correct rate</p>
              <p className="mt-1 text-xl font-semibold text-teal-800">{correctRate}%</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

type MetricProps = {
  label: string;
  value: number;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[#FAFCFF] p-3">
      <p className="text-muted text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

