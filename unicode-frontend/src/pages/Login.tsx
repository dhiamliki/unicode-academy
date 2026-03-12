import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { googleLoginApi, loginApi } from "../api/auth";
import { setToken } from "../auth/session";
import "../styles/public-pages.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const defaultGoogleClientId =
    "568033154132-fp8d7klc9pndgheqk7jjvnt6qtcniije.apps.googleusercontent.com";
  const googleLoginEnabled = Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID ?? defaultGoogleClientId
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("L'email et le mot de passe sont obligatoires.");
      return;
    }

    setLoading(true);
    try {
      const { token } = await loginApi({ email: email.trim(), password });
      setToken(token);
      nav("/dashboard", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        err?.message ??
        "Connexion echouee";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleLoginSuccess(credential: string | undefined) {
    if (!credential) {
      setError("Connexion Google echouee");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { token } = await googleLoginApi({ idToken: credential });
      setToken(token);
      nav("/dashboard", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        err?.message ??
        "Connexion Google echouee";
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
          <h1>Bon retour dans votre espace d'apprentissage.</h1>
          <p>
            Continuez vos cours, suivez votre progression, participez aux discussions en direct et
            restez en tete du classement.
          </p>
          <ul>
            <li>Parcours de cours structure par langage</li>
            <li>Chat en temps reel avec pairs et formateurs</li>
            <li>Suivi de progression et metriques de completion</li>
          </ul>
        </section>

        <section className="auth-form-card">
          <p className="landing-kicker" style={{ color: "#0f766e" }}>Connexion</p>
          <h2 className="auth-form-title">Se connecter a UniCode</h2>

          <form onSubmit={onSubmit} className="auth-form">
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
                  placeholder="Saisissez le mot de passe"
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

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            {error && <p className="auth-error">{error}</p>}
          </form>

          {googleLoginEnabled && (
            <div className="auth-google">
              <GoogleLogin
                locale="fr"
                onSuccess={(credentialResponse) =>
                  void onGoogleLoginSuccess(credentialResponse.credential)
                }
                onError={() => setError("Connexion Google echouee")}
              />
            </div>
          )}

          <p className="auth-footer">
            Vous n&apos;avez pas de compte ? <Link to="/register" className="auth-link">Creer un compte</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
