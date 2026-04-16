import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/auth";
import { beginAuthenticatedSession } from "../auth/authState";
import { getErrorMessage } from "../utils/errorMessage";

const featureItems = [
  "Parcours visuels par langage",
  "Leçons + console intégrée en direct",
  "Exercices progressifs pour ancrer les bases",
  "Classement hebdomadaire et progression continue",
] as const;

const onboardingHighlights = [
  { value: "Rapide", label: "inscription en 1 min" },
  { value: "Guidé", label: "parcours structurés" },
  { value: "Focus", label: "objectifs par unité" },
] as const;

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim()) {
      toast.error("Le pseudo est obligatoire.");
      return;
    }

    if (!email.trim()) {
      toast.error("L’email est obligatoire.");
      return;
    }

    if (strength.score < 4) {
      toast.error("Le mot de passe doit contenir 8 caractères, une majuscule, un chiffre et un caractère spécial.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerApi({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      beginAuthenticatedSession(response.token, response.refreshToken);
      toast.success("Compte créé avec succès.");
      navigate("/accueil", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Inscription impossible."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <aside className="auth-side">
        <Link to="/register" className="auth-brand" aria-label="UniCode Academy">
          <span>Uni</span>
          <span>Code</span>
        </Link>

        <div className="auth-copy">
          <p className="auth-kicker">// apprends à coder</p>
          <h1 className="auth-headline">
            Commence ton voyage,
            <br />
            rejoins la communauté.
          </h1>
          <p className="auth-body">
            Lance ton parcours, apprends avec une interface dense et avance unité par unité sans
            perdre le fil.
          </p>

          <div className="feature-list">
            {featureItems.map((item) => (
              <div key={item} className="feature-item">
                <span className="feature-dot" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            }}
          >
            {onboardingHighlights.map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "var(--r-lg)",
                  padding: "12px 10px",
                }}
              >
                <div style={{ color: "#ffffff", fontSize: 18, fontWeight: 800 }}>{item.value}</div>
                <div
                  style={{
                    color: "var(--sidebar-text)",
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    marginTop: 4,
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="auth-footer">© 2026 UniCode Academy</p>
      </aside>

      <main className="auth-main">
        <div className="auth-panel fu">
          <div className="page-stack">
            <div>
              <span className="badge badge-teal">Nouveau compte</span>
            </div>
            <h1 className="auth-title">Créer ton compte</h1>
            <p className="auth-subtitle">Entre dans l’académie et commence dès aujourd’hui</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="register-username" className="field-label">
                Pseudo
              </label>
              <input
                id="register-username"
                className="field"
                type="text"
                placeholder="Ton pseudo"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="register-email" className="field-label">
                Email
              </label>
              <input
                id="register-email"
                className="field"
                type="email"
                placeholder="toi@unicode.academy"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="register-password" className="field-label">
                Mot de passe
              </label>
              <div className="field-inline">
                <input
                  id="register-password"
                  className="field"
                  type={showPassword ? "text" : "password"}
                  placeholder="Choisis un mot de passe"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? "Masquer" : "Voir"}
                </button>
              </div>

              <div className="password-strength">
                <div className="password-strength-bars">
                  {Array.from({ length: 4 }, (_, index) => (
                    <span
                      key={`strength-${index}`}
                      className="password-strength-segment"
                      style={{
                        background: index < strength.score ? strength.color : "var(--border)",
                      }}
                    />
                  ))}
                </div>
                <div className="password-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="field-label">
                Confirmer le mot de passe
              </label>
              <div className="field-inline">
                <input
                  id="register-confirm-password"
                  className="field"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Retape ton mot de passe"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? "Masquer" : "Voir"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-xl" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="auth-switch">
            Déjà inscrit ? <Link to="/login">Se connecter →</Link>
          </p>

          <p
            style={{
              color: "var(--text-3)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              marginTop: 14,
              textAlign: "center",
            }}
          >
            Ton espace sera prêt immédiatement avec progression, classement et parcours sauvegardés.
          </p>
        </div>
      </main>
    </div>
  );
}

function getPasswordStrength(password: string) {
  const rules = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = rules.filter(Boolean).length;

  if (score <= 1) {
    return { score, label: "Faible", color: "var(--red)" };
  }

  if (score === 2) {
    return { score, label: "Moyen", color: "var(--orange)" };
  }

  if (score === 3) {
    return { score, label: "Bon", color: "var(--yellow)" };
  }

  return { score, label: "Fort", color: "var(--green)" };
}
