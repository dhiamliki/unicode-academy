type StreakIndicatorProps = {
  streak: number;
  lastWasError: boolean;
};

export default function StreakIndicator({
  streak,
  lastWasError,
}: StreakIndicatorProps) {
  const safeStreak = Math.max(0, Math.min(3, streak));
  const errorIndex = lastWasError ? safeStreak : -1;

  return (
    <div className="exercise-streak">
      <div className="streak-row" aria-label={`Série actuelle ${safeStreak} sur 3`}>
        {Array.from({ length: 3 }, (_, index) => {
          const isFilled = index < safeStreak;
          const isError = !isFilled && index === errorIndex;

          return (
            <span
              key={`streak-${index}`}
              className={`streak-bubble${isFilled ? " filled" : ""}${isError ? " error" : ""}`}
            >
              {isFilled ? "✓" : isError ? "✕" : ""}
            </span>
          );
        })}
      </div>

      <p className="exercise-subline">
        3 bonnes réponses d&apos;affilée pour terminer l&apos;unité
      </p>
    </div>
  );
}
