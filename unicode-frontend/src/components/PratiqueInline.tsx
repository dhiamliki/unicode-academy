import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildUnitExercisesPath } from "../lib/academy";

export type PracticeChallengeView = {
  title: string;
  objective: string;
  instructions: string;
  expectedOutput: string;
  expectedOutputDisplay: string;
  expectedOutputKind: "exact" | "guidance";
  hint: string;
  starterCode: string;
  validationMode: "stdout" | "preview";
  expectedOutputPending: boolean;
};

export type PracticeRunAssessment = {
  kind: "success" | "close" | "failure" | "guidance" | "error";
  title: string;
  message: string;
  actualOutput?: string;
  expectedOutput?: string;
  recommendExercises?: boolean;
};

type ValidationStatus = "idle" | "running" | "ready" | "success" | "failure";

type PratiqueInlineProps = {
  lessonId: number;
  courseId: number;
  /** Increments when the parent resets the editor so local validation UI returns to a clean state. */
  workspaceResetSignal?: number;
  consoleOutput: string;
  challenge: PracticeChallengeView;
  runAssessment: PracticeRunAssessment | null;
  hasRunCode: boolean;
  isRunning: boolean;
  isWebLesson?: boolean;
  onAiOpen: () => void;
  onValidate: () => void;
  onBack: () => void;
};

export default function PratiqueInline({
  lessonId,
  courseId,
  workspaceResetSignal = 0,
  consoleOutput,
  challenge,
  runAssessment,
  hasRunCode,
  isRunning,
  isWebLesson = false,
  onAiOpen,
  onValidate,
  onBack,
}: PratiqueInlineProps) {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const timeoutRef = useRef<number | null>(null);
  const [status, setStatus] = useState<ValidationStatus>("idle");
  const [showHint, setShowHint] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [actualOutput, setActualOutput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setStatus("idle");
    setShowHint(false);
    setShowContinue(false);
    setActualOutput("");
    setExpectedOutput("");
  }, [
    challenge.expectedOutput,
    challenge.expectedOutputDisplay,
    challenge.hint,
    challenge.instructions,
    challenge.objective,
    challenge.starterCode,
    lessonId,
    workspaceResetSignal,
  ]);

  useEffect(() => {
    if (showContinue || status === "success") {
      return;
    }

    if (isRunning) {
      setStatus("running");
      return;
    }

    if (!hasRunCode) {
      setStatus("idle");
      return;
    }

    if (status !== "failure") {
      setStatus("ready");
    }
  }, [hasRunCode, isRunning, showContinue, status]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const steps = useMemo(
    () => buildPracticeSteps(challenge.validationMode === "preview" || isWebLesson),
    [challenge.validationMode, isWebLesson]
  );

  function handleValidate() {
    if (challenge.expectedOutputPending || isRunning || showContinue || !hasRunCode) {
      return;
    }

    if (challenge.validationMode === "preview" || isWebLesson) {
      triggerSuccess("", "");
      return;
    }

    const actualNormalized = normalizeOutput(consoleOutput.trim());
    const expectedNormalized = normalizeOutput(challenge.expectedOutput.trim());

    if (!expectedNormalized) {
      triggerSuccess(actualNormalized, "");
      return;
    }

    if (actualNormalized === expectedNormalized) {
      triggerSuccess(actualNormalized, expectedNormalized);
      return;
    }

    setActualOutput(actualNormalized);
    setExpectedOutput(expectedNormalized);
    setStatus("failure");
  }

  function triggerSuccess(nextActualOutput: string, nextExpectedOutput: string) {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    setActualOutput(nextActualOutput);
    setExpectedOutput(nextExpectedOutput);
    setStatus("success");

    timeoutRef.current = window.setTimeout(() => {
      onValidate();
      setShowContinue(true);
      timeoutRef.current = null;
    }, 1000);
  }

  function handleGoToExercises() {
    if (!unitId) {
      navigate(`/apprendre/${courseId}`);
      return;
    }

    navigate(buildUnitExercisesPath(courseId, unitId));
  }

  const statusMessage = getStatusMessage({
    challenge,
    status,
    actualOutput,
    expectedOutput,
    runAssessment,
  });
  const statusTone = getStatusTone(status, runAssessment);
  const hasExactExpectedOutput = Boolean(challenge.expectedOutput.trim());
  const expectedLabel =
    challenge.validationMode === "preview" || isWebLesson
      ? challenge.expectedOutputKind === "exact"
        ? "RENDU ATTENDU"
        : "REPERES DE VERIFICATION"
      : challenge.expectedOutputKind === "exact"
        ? "SORTIE ATTENDUE"
        : "REPERES DE VERIFICATION";
  const canAutoValidate =
    challenge.validationMode === "preview" || isWebLesson || hasExactExpectedOutput;
  const shouldHighlightExercises = showContinue || Boolean(runAssessment?.recommendExercises);
  const validateDisabled = challenge.expectedOutputPending || isRunning || !hasRunCode;

  return (
    <div className="pratique-panel">
      <div className="pratique-scroll">
        <div className="pratique-header">
          <span className="badge badge-indigo">Defi de code</span>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Retour a la lecon
          </button>
        </div>

        <div className="pratique-intro">
          <h2 className="pratique-title">{challenge.title}</h2>
          <p className="pratique-subtitle">
            Lis le defi, modifie le code a droite, execute-le, puis verifie le resultat avant de continuer.
          </p>
        </div>

        <section className="pratique-card">
          <p className="pratique-label">OBJECTIF</p>
          <p className="pratique-copy">{challenge.objective}</p>
        </section>

        <section className="pratique-card">
          <p className="pratique-label">CE QUE TU DOIS FAIRE</p>
          <p className="pratique-copy">{challenge.instructions}</p>
        </section>

        <section className="pratique-card pratique-steps-card">
          <p className="pratique-label">ETAPES</p>
          <ol className="pratique-step-list">
            {steps.map((step) => (
              <li key={step} className="pratique-step-item">
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="pratique-card pratique-actions-card">
          <p className="pratique-label">ACTIONS CLES</p>
          <div className="pratique-action-list">
            <div className="pratique-action-item">
              <span className="pratique-action-pill">Executer</span>
              <p className="pratique-action-copy">Lance ton code dans la barre d'outils a droite.</p>
            </div>
            <div className="pratique-action-item">
              <span className="pratique-action-pill">Reinitialiser</span>
              <p className="pratique-action-copy">Repars du code de depart si tu veux recommencer proprement.</p>
            </div>
            <div className="pratique-action-item">
              <span className="pratique-action-pill">Valider</span>
              <p className="pratique-action-copy">
                {canAutoValidate
                  ? "Valide une fois la console ou l'apercu conforme."
                  : "Quand le comportement te semble correct, marque le defi comme verifie."}
              </p>
            </div>
            <div className="pratique-action-item">
              <span className="pratique-action-pill">Exercices</span>
              <p className="pratique-action-copy">Tu peux poursuivre vers les exercices a tout moment.</p>
            </div>
          </div>
        </section>

        <section className="pratique-output-card">
          <p className="pratique-label pratique-label-indigo">{expectedLabel}</p>
          <pre className="pratique-output-text">
            {challenge.expectedOutputPending
              ? "Preparation de la sortie attendue..."
              : challenge.expectedOutputDisplay}
          </pre>
        </section>

        <div className="pratique-help-grid">
          <section className="pratique-card">
            <div className="pratique-help-head">
              <p className="pratique-label">BESOIN D'AIDE ?</p>
              <button type="button" className="pratique-ai-button" onClick={onAiOpen}>
                Ouvrir l'aide guidee
              </button>
            </div>
            <p className="pratique-copy">
              Obtiens un indice, une explication du concept ou un repere de debogage selon ton contexte.
            </p>
          </section>

          <section className="pratique-card">
            <div className="pratique-help-head">
              <p className="pratique-label">INDICE</p>
              <button
                type="button"
                className="pratique-hint-toggle"
                onClick={() => setShowHint((current) => !current)}
              >
                {showHint ? "Masquer" : "Voir"}
              </button>
            </div>
            {showHint ? (
              <p className="pratique-copy">{challenge.hint}</p>
            ) : (
              <p className="pratique-copy pratique-muted">
                Revele l'indice seulement si tu bloques apres une execution.
              </p>
            )}
          </section>
        </div>

        <section className={`pratique-status pratique-status-${statusTone}`}>
          {statusMessage}
        </section>
      </div>

      <div className="pratique-footer">
        {shouldHighlightExercises ? (
          <div className="pratique-next-step">
            Prochaine etape recommandee : consolide cette notion avec les exercices.
          </div>
        ) : null}
        <div className="pratique-footer-copy">
          {runAssessment?.kind === "error"
            ? "Corrige d'abord le premier message d'erreur, puis relance ton code."
            : hasRunCode
              ? canAutoValidate
                ? "Resultat relu. Tu peux maintenant valider le defi ou passer directement aux exercices."
                : "Le defi n'a pas de correction automatique fiable. Verifie le comportement demande, puis marque-le comme verifie ou passe aux exercices."
            : "Lis l'objectif, modifie le code a droite, execute-le, puis reviens ici pour valider ou continuer."}
        </div>
        <div className="pratique-footer-actions">
          <button
            type="button"
            className={`btn btn-full pratique-exercise-cta${shouldHighlightExercises ? " is-highlighted" : " btn-ghost"}`}
            onClick={handleGoToExercises}
          >
            {showContinue || runAssessment?.kind === "success"
              ? "Passer aux exercices"
              : "Aller aux exercices"}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={handleValidate}
            disabled={validateDisabled}
          >
            {challenge.expectedOutputPending
              ? "Preparation..."
              : isRunning
                ? "Validation..."
                : !hasRunCode
                  ? "Execute puis valide"
                  : !canAutoValidate
                    ? "Marquer comme verifie"
                    : showContinue
                      ? "Defi valide"
                      : "Valider le defi"}
          </button>
        </div>
      </div>
    </div>
  );
}

function buildPracticeSteps(isPreviewMode: boolean) {
  return isPreviewMode
    ? [
        "Lis d'abord l'objectif du defi.",
        "Modifie le code dans l'editeur a droite.",
        "Clique sur Executer pour actualiser l'apercu.",
        "Utilise Reinitialiser si tu veux repartir du code de depart.",
        "Verifie le rendu, puis valide ou continue vers les exercices.",
      ]
    : [
        "Lis d'abord l'objectif du defi.",
        "Modifie ou complete le code dans l'editeur a droite.",
        "Clique sur Executer pour lancer ton programme.",
        "Observe la console, puis utilise Reinitialiser si besoin.",
        "Valide ensuite le defi ou continue vers les exercices.",
      ];
}

function getStatusMessage({
  challenge,
  status,
  actualOutput,
  expectedOutput,
  runAssessment,
}: {
  challenge: PracticeChallengeView;
  status: ValidationStatus;
  actualOutput: string;
  expectedOutput: string;
  runAssessment: PracticeRunAssessment | null;
}) {
  if (status === "success") {
    return (
      <>
        <p className="pratique-status-title success">
          {challenge.expectedOutputKind === "exact" ? "Defi valide" : "Verification enregistree"}
        </p>
        <p className="pratique-status-copy">
          {challenge.expectedOutputKind !== "exact"
            ? "Tu as marque ce defi comme verifie. Tu peux maintenant continuer vers les exercices."
            : challenge.validationMode === "preview"
              ? "Le rendu est pret. Tu peux maintenant continuer vers les exercices."
              : "Ton code produit bien la sortie attendue."}
        </p>
      </>
    );
  }

  if (status === "failure") {
    return (
      <>
        <p className="pratique-status-title failure">Pas encore valide</p>
        <div className="pratique-diff">
          <p className="pratique-diff-line">
            <span>Ta sortie</span>
            <code>{formatOutputForDisplay(actualOutput)}</code>
          </p>
          <p className="pratique-diff-line">
            <span>Attendu</span>
            <code>{formatOutputForDisplay(expectedOutput)}</code>
          </p>
        </div>
      </>
    );
  }

  if (status === "running") {
    return (
      <div className="pratique-status-idle is-running">
        <span className="pratique-status-arrow">...</span>
        <p className="pratique-status-copy muted">
          Execution en cours. Observe ensuite le resultat ici avant de valider.
        </p>
      </div>
    );
  }

  if (runAssessment?.kind === "error") {
    return (
      <>
        <p className="pratique-status-title failure">{runAssessment.title}</p>
        <p className="pratique-status-copy">{runAssessment.message}</p>
      </>
    );
  }

  if (status === "ready") {
    if (challenge.validationMode === "stdout" && !challenge.expectedOutput.trim()) {
      return (
        <div className="pratique-status-idle">
          <span className="pratique-status-arrow">4</span>
          <p className="pratique-status-copy muted">
            La validation automatique n'est pas disponible pour ce defi. Verifie la console, puis clique sur Marquer comme verifie si le comportement te semble correct.
          </p>
        </div>
      );
    }

    if (runAssessment?.kind === "success") {
      return (
        <>
          <p className="pratique-status-title success">{runAssessment.title}</p>
          <p className="pratique-status-copy">{runAssessment.message}</p>
        </>
      );
    }

    if (runAssessment?.kind === "close") {
      return (
        <>
          <p className="pratique-status-title close">{runAssessment.title}</p>
          <p className="pratique-status-copy">{runAssessment.message}</p>
          <div className="pratique-diff">
            <p className="pratique-diff-line">
              <span>Ta sortie</span>
              <code>{formatOutputForDisplay(runAssessment.actualOutput ?? "")}</code>
            </p>
            <p className="pratique-diff-line">
              <span>Attendu</span>
              <code>{formatOutputForDisplay(runAssessment.expectedOutput ?? "")}</code>
            </p>
          </div>
        </>
      );
    }

    if (runAssessment?.kind === "failure") {
      return (
        <>
          <p className="pratique-status-title failure">{runAssessment.title}</p>
          <p className="pratique-status-copy">{runAssessment.message}</p>
          <div className="pratique-diff">
            <p className="pratique-diff-line">
              <span>Ta sortie</span>
              <code>{formatOutputForDisplay(runAssessment.actualOutput ?? "")}</code>
            </p>
            <p className="pratique-diff-line">
              <span>Attendu</span>
              <code>{formatOutputForDisplay(runAssessment.expectedOutput ?? "")}</code>
            </p>
          </div>
        </>
      );
    }

    if (runAssessment?.kind === "guidance") {
      return (
        <>
          <p className="pratique-status-title guidance">{runAssessment.title}</p>
          <p className="pratique-status-copy">{runAssessment.message}</p>
        </>
      );
    }

    return (
      <div className="pratique-status-idle">
        <span className="pratique-status-arrow">4</span>
        <p className="pratique-status-copy muted">
          {challenge.validationMode === "preview"
            ? "Verifie maintenant l'apercu a droite, puis valide le defi."
            : "La console est prete. Compare-la a la sortie attendue, puis valide le defi."}
        </p>
      </div>
    );
  }

  return (
    <div className="pratique-status-idle">
      <span className="pratique-status-arrow">1</span>
      <p className="pratique-status-copy muted">
        {challenge.validationMode === "preview"
          ? "Commence par lire le defi puis execute ton code pour actualiser l'apercu."
          : "Commence par lire le defi puis execute ton code pour voir le resultat dans la console."}
      </p>
    </div>
  );
}

function getStatusTone(status: ValidationStatus, runAssessment: PracticeRunAssessment | null) {
  if (status === "success") {
    return "success";
  }

  if (status === "failure") {
    return "failure";
  }

  if (status === "running") {
    return "running";
  }

  if (runAssessment?.kind === "close") {
    return "close";
  }

  if (runAssessment?.kind === "failure" || runAssessment?.kind === "error") {
    return "failure";
  }

  if (runAssessment?.kind === "guidance") {
    return "guidance";
  }

  if (runAssessment?.kind === "success") {
    return "success";
  }

  return "idle";
}

function normalizeOutput(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

function formatOutputForDisplay(value: string) {
  return value || "(aucune sortie)";
}
