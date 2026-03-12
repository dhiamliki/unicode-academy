import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/auth";
import { setAuthTokens } from "../auth/session";
import "../styles/public-pages.css";

export default function Register() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim()) {
      setError("Le nom d'utilisateur est obligatoire.");
      return;
    }
    if (!email.trim()) {
      setError("L'email est obligatoire.");
      return;
    }
    const hasStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    if (!hasStrongPassword) {
      setError(
        "Le mot de passe doit contenir au moins 8 caracteres, avec 1 majuscule, 1 minuscule et 1 chiffre."
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { token, refreshToken } = await registerApi({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      setAuthTokens(token, refreshToken);
      setSuccess("Compte cree. Redirection...");
      nav("/dashboard", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        err?.message ??
        "Inscription echouee";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="public-root">
      <div className="auth-layout">
        <section className="auth-marketing">
          <Link to="/" className="public-brand">
            <span className="public-brand-mark">U</span>
            <span style={{ color: "#ffffff" }}>UniCode</span>
          </Link>
          <h1>Creez votre compte et commencez a apprendre aujourd'hui.</h1>
          <p>
            Accedez aux parcours de langage, aux pieces jointes des cours, aux quiz et au chat en
            direct depuis un tableau de bord unifie.
          </p>
          <ul>
            <li>Suivez automatiquement la progression des lecons et quiz</li>
            <li>Defiez les autres dans un classement a score reel</li>
            <li>Telechargez les ressources de cours au meme endroit</li>
          </ul>
        </section>

        <section className="auth-form-card">
          <p className="landing-kicker" style={{ color: "#0f766e" }}>Inscription</p>
          <h2 className="auth-form-title">Creer votre compte UniCode</h2>

          <form onSubmit={onSubmit} className="auth-form">
            <div>
              <label className="auth-label">Nom d'utilisateur</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Votre nom d'utilisateur"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="auth-label">E-mail</label>
              <input
                className="auth-input"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="auth-label">Mot de passe</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input has-trailing-action"
                  type={showPassword ? "text" : "password"}
                  placeholder="Creez un mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="auth-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            <div>
              <label className="auth-label">Confirmer le mot de passe</label>
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Confirmez le mot de passe"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creation du compte..." : "Creer le compte"}
            </button>

            {error && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}
          </form>

          <p className="auth-footer">
            Vous avez deja un compte ? <Link to="/login" className="auth-link">Se connecter</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
