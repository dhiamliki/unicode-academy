import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getLeaderboard } from "../api/leaderboard";
import { getCurrentUser } from "../api/users";
import { EmptyState } from "../components/EmptyState";
import { getInitials, getLeaderboardRow } from "../lib/academy";
import { queryKeys } from "../lib/queryKeys";
import { getErrorMessage } from "../utils/errorMessage";

const podiumConfig = {
  1: { medal: "🥇", className: "first", color: "var(--teal)", avatarClass: "first" },
  2: { medal: "🥈", className: "second", color: "var(--indigo)", avatarClass: "other" },
  3: { medal: "🥉", className: "third", color: "var(--green)", avatarClass: "other" },
} as const;

export default function ClassementPage() {
  const navigate = useNavigate();

  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  const leaderboardQuery = useQuery({
    queryKey: queryKeys.leaderboard(50),
    queryFn: () => getLeaderboard(50),
  });

  useEffect(() => {
    const firstError = leaderboardQuery.error ?? currentUserQuery.error;

    if (firstError) {
      toast.error(getErrorMessage(firstError, "Impossible de charger le classement."));
    }
  }, [currentUserQuery.error, leaderboardQuery.error]);

  if (
    leaderboardQuery.isLoading ||
    currentUserQuery.isLoading ||
    !leaderboardQuery.data ||
    !currentUserQuery.data
  ) {
    return (
      <div className="page page-stack">
        <section className="card content-section">
          <div className="page-stack">
            <p className="section-kicker">Classement</p>
            <h1 className="section-title">Chargement du podium</h1>
            <p className="text-muted">
              Nous récupérons les scores de la semaine et ton rang actuel.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const entries = leaderboardQuery.data;
  const currentUser = currentUserQuery.data;
  const topThree = entries.filter((entry) => entry.rank <= 3).sort((a, b) => a.rank - b.rank);
  const rest = entries.filter((entry) => entry.rank > 3);
  const topScore = Math.max(entries[0]?.points ?? 1, 1);
  const currentUserRow = getLeaderboardRow(entries, currentUser.username);

  if (entries.length === 0) {
    return (
      <div className="page page-stack">
        <section className="card content-section">
          <EmptyState
            emoji="🏆"
            title="Classement vide"
            subtitle="Termine ta première leçon pour apparaître ici."
            actionLabel="Commencer à apprendre"
            onAction={() => navigate("/apprendre")}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="page page-stack">
      <section className="card content-section fu">
        <div className="section-head" style={{ alignItems: "center" }}>
          <div className="page-stack" style={{ gap: 8 }}>
            <p className="section-kicker">Classement hebdomadaire</p>
            <h1 className="section-title">Leaders de la semaine</h1>
            <p className="text-muted">
              Observe le podium, compare ta progression et vise la première place.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <span className="badge badge-teal">{`${entries.length} joueurs classés`}</span>
            <span className="badge badge-yellow">
              {currentUserRow ? `#${currentUserRow.rank} · ${currentUserRow.points} XP` : "Hors classement"}
            </span>
          </div>
        </div>
      </section>

      <section className="card content-section fu fu1">
        <header className="leaderboard-head">
          <div className="leaderboard-icon">🏆</div>
          <h2 className="section-title">Podium</h2>
          <p className="leaderboard-subtitle">Cette semaine</p>
        </header>

        <div className="leaderboard-podium" style={{ marginTop: 20 }}>
          {[2, 1, 3].map((rank) => {
            const entry = topThree.find((item) => item.rank === rank);
            const config = podiumConfig[rank as 1 | 2 | 3];

            if (!entry) {
              return (
                <div key={rank} className="podium-slot">
                  <div className="podium-medal">{config.medal}</div>
                  <div
                    className={`podium-avatar ${config.avatarClass}`}
                    style={{
                      background: `${config.color}22`,
                      border: `3px solid ${config.color}66`,
                      color: config.color,
                    }}
                  >
                    --
                  </div>
                  <div className="podium-name">À venir</div>
                  <div
                    className={`podium-platform ${config.className}`}
                    style={{ background: `${config.color}22`, borderColor: `${config.color}55` }}
                  >
                    <span className="podium-points">0 XP</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={entry.rank} className="podium-slot">
                <div className="podium-medal">{config.medal}</div>
                <div
                  className={`podium-avatar ${config.avatarClass}`}
                  style={{
                    background: `linear-gradient(135deg, ${config.color}, rgba(255,255,255,0.45))`,
                    border: `3px solid ${config.color}`,
                  }}
                >
                  {getInitials(entry.username)}
                </div>
                <div className="podium-name">{entry.username}</div>
                <div
                  className={`podium-platform ${config.className}`}
                  style={{ background: `${config.color}22`, borderColor: `${config.color}66` }}
                >
                  <span className="podium-points">{`${entry.points} XP`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card content-section fu fu2">
        <div className="section-head">
          <div>
            <p className="section-kicker">Top joueurs</p>
            <h2 className="section-title">Classement complet</h2>
          </div>

          {currentUserRow ? (
            <span className="badge badge-indigo">{`Ton rang: #${currentUserRow.rank}`}</span>
          ) : null}
        </div>

        <div className="rank-list" style={{ marginTop: 14 }}>
          {rest.map((entry) => {
            const isMe = entry.username.trim().toLowerCase() === currentUser.username.trim().toLowerCase();
            const progress = Math.max(8, Math.round((entry.points / topScore) * 100));

            return (
              <div key={`${entry.username}-${entry.rank}`} className={`leader-row${isMe ? " me" : ""}`}>
                <span className="leader-rank">{`#${entry.rank}`}</span>
                <span className="leader-avatar" style={{ background: avatarColor(entry.rank) }}>
                  {getInitials(entry.username)}
                </span>
                <span className="leader-name">
                  {entry.username}
                  {isMe ? (
                    <span className="badge badge-teal" style={{ marginLeft: 8 }}>
                      toi
                    </span>
                  ) : null}
                </span>
                <span className="prog-track leader-bar">
                  <span className="prog-fill" style={{ width: `${progress}%` }} />
                </span>
                <span className="leader-xp">{`${entry.points} XP`}</span>
              </div>
            );
          })}
        </div>

        {currentUserRow && currentUserRow.rank <= 3 ? (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              border: "1px solid var(--teal-ring)",
              background: "var(--teal-soft)",
              borderRadius: "var(--r-md)",
              color: "var(--text-2)",
              fontSize: 13,
            }}
          >
            Tu es déjà sur le podium cette semaine. Continue pour garder ton avance.
          </div>
        ) : null}
      </section>
    </div>
  );
}

function avatarColor(rank: number) {
  const palette = [
    "linear-gradient(135deg, var(--orange), #ea580c)",
    "linear-gradient(135deg, #ec4899, #db2777)",
    "linear-gradient(135deg, var(--indigo), #4f46e5)",
    "linear-gradient(135deg, var(--green), #059669)",
    "linear-gradient(135deg, var(--teal), #0097a7)",
  ];

  return palette[(rank - 4 + palette.length * 10) % palette.length];
}
