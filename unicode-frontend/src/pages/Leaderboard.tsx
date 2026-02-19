import { useEffect, useMemo, useState } from "react";
import { Crown, Trophy } from "lucide-react";
import { getLeaderboard, type LeaderboardEntryDto } from "../api/leaderboard";

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getLeaderboard(20);
        if (!cancelled) {
          setRows(data);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Failed to load leaderboard";
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

  const maxPoints = useMemo(() => {
    const top = rows[0]?.points ?? 0;
    return top > 0 ? top : 1;
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEFCE8] text-[#FACC15]">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Leaderboard</h2>
            <p className="text-sm text-slate-600">Top learners ranked by lessons and exercise performance.</p>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-600">Loading leaderboard...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="panel p-4 text-sm text-slate-600">No leaderboard data yet.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <section className="panel overflow-hidden">
          <div className="grid grid-cols-[64px_minmax(220px,1fr)_120px_160px_160px] items-center border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Rank</span>
            <span>User</span>
            <span>Points</span>
            <span>Lessons</span>
            <span>Correct</span>
          </div>

          <div>
            {rows.map((row) => {
              const ratio = Math.round((row.points / maxPoints) * 100);
              const isFirst = row.rank === 1;
              return (
                <div
                  key={`${row.rank}-${row.username}`}
                  className={`grid grid-cols-[64px_minmax(220px,1fr)_120px_160px_160px] items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0 ${
                    isFirst ? "border-[#FACC15] bg-[#FEFCE8]" : "border-slate-100"
                  }`}
                >
                  <span className={`font-semibold ${isFirst ? "text-[#92400E]" : "text-slate-700"}`}>#{row.rank}</span>

                  <div>
                    <p className="flex items-center gap-2 font-medium text-slate-900">
                      {row.rank === 1 && <Crown className="h-4 w-4 text-[#FACC15]" />}
                      {row.username}
                    </p>
                    <div className="progress-track mt-1 h-1.5">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.max(4, ratio)}%` }}
                      />
                    </div>
                  </div>

                  <span className="font-semibold text-slate-900">{row.points}</span>
                  <span className="text-slate-700">{row.completedLessons}</span>
                  <span className="text-slate-700">{row.correctExercises}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

