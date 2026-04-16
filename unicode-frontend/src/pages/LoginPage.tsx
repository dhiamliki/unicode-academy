import { useState, type FormEvent } from "react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { googleLoginApi, loginApi } from "../api/auth";
import { beginAuthenticatedSession } from "../auth/authState";
import { getErrorMessage } from "../utils/errorMessage";

const featureItems = [
  "Parcours visuels par langage",
  "Console live HTML / CSS / JS",
  "Exercices : 3 bonnes réponses pour avancer",
  "Classement et progression suivie",
] as const;

const highlightItems = [
  { value: "12+", label: "langages guidés" },
  { value: "Live", label: "éditeur intégré" },
  { value: "24/7", label: "progression suivie" },
] as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const googleLoginEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email et mot de passe obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginApi({
        email: email.trim(),
        password,
      });

      beginAuthenticatedSession(response.token, response.refreshToken);
      toast.success("Connexion réussie.");
      navigate("/accueil", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Connexion impossible."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credential: string | undefined) {
    if (!credential) {
      toast.error("Connexion Google impossible.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await googleLoginApi({ idToken: credential });
      beginAuthenticatedSession(response.token, response.refreshToken);
      toast.success("Connexion Google réussie.");
      navigate("/accueil", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Connexion Google impossible."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <aside className="auth-side">
        <Link to="/login" className="auth-brand" aria-label="UniCode Academy">
          <span>Uni</span>
          <span>Code</span>
        </Link>

        <div className="auth-copy">
          <p className="auth-kicker">// apprends à coder</p>
          <h1 className="auth-headline">
            Maîtrise le <span className="accent">code</span>,
            <br />
            une leçon à la fois.
          </h1>
          <p className="auth-body">
            Cours structurés, console intégrée, exercices progressifs et classement en temps réel
            — tout en un.
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
            {highlightItems.map((item) => (
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
              <span className="badge badge-teal">Accès sécurisé</span>
            </div>
            <h1 className="auth-title">Bon retour</h1>
            <p className="auth-subtitle">Connecte-toi pour continuer ta progression</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" className="field-label">
                Email
              </label>
              <input
                id="login-email"
                className="field"
                type="email"
                placeholder="toi@unicode.academy"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <div className="field-head">
                <label htmlFor="login-password" className="field-label">
                  Mot de passe
                </label>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => toast("La réinitialisation arrive bientôt.")}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <div className="field-inline">
                <input
                  id="login-password"
                  className="field"
                  type={showPassword ? "text" : "password"}
                  placeholder="Entre ton mot de passe"
                  autoComplete="current-password"
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
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-xl" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {googleLoginEnabled ? (
            <>
              <div className="auth-divider">ou</div>

              <div style={{ position: "relative" }}>
                <button type="button" className="google-button">
                  <span className="google-glyph" aria-hidden="true" />
                  <span>Continuer avec Google</span>
                </button>

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.01,
                    overflow: "hidden",
                    borderRadius: "12px",
                  }}
                >
                  <GoogleLogin
                    locale="fr"
                    width="100%"
                    onSuccess={(response) => void handleGoogleSuccess(response.credential)}
                    onError={() => toast.error("Connexion Google impossible.")}
                  />
                </div>
              </div>
            </>
          ) : null}

          <p className="auth-switch">
            Pas de compte ? <Link to="/register">Crée le tien →</Link>
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
            Tes cours, ta progression et ton classement sont synchronisés dès la connexion.
          </p>
        </div>
      </main>
    </div>
  );
}
