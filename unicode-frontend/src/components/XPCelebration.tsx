type XPCelebrationProps = {
  lessonTitle: string;
  onContinue: () => void;
};

export default function XPCelebration({
  lessonTitle,
  onContinue,
}: XPCelebrationProps) {
  return (
    <div className="xp-overlay" role="dialog" aria-modal="true" aria-labelledby="xp-celebration-title">
      <div className="xp-viewport">
        <div className="xp-card">
          <p className="section-kicker">Progression</p>
          <h2 id="xp-celebration-title" className="celebration-title">
            Unite validee
          </h2>
          <p className="celebration-text">
            <strong>{lessonTitle}</strong> est maintenant marque comme termine. Passe a l'etape
            suivante ou reviens au parcours.
          </p>

          <button type="button" className="btn btn-primary btn-full" onClick={onContinue}>
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
