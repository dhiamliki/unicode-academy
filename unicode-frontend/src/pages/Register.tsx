import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../api/auth";
import { setToken } from "../auth/session";
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
      setError("Username is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const registerMessage = await registerApi({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      if (!registerMessage.toLowerCase().includes("success")) {
        throw new Error(registerMessage || "Registration failed");
      }

      const { token } = await loginApi({ email: email.trim(), password });
      setToken(token);
      setSuccess("Account created. Redirecting...");
      nav("/dashboard", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        err?.message ??
        "Registration failed";
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
          <h1>Create your account and start learning today.</h1>
          <p>
            Access language tracks, course attachments, quizzes, and live chat from a unified dashboard.
          </p>
          <ul>
            <li>Track lesson and quiz progress automatically</li>
            <li>Compete on leaderboard with real scoring</li>
            <li>Download course resources from one place</li>
          </ul>
        </section>

        <section className="auth-form-card">
          <p className="landing-kicker" style={{ color: "#0f766e" }}>Register</p>
          <h2 className="auth-form-title">Create your UniCode account</h2>

          <form onSubmit={onSubmit} className="auth-form">
            <div>
              <label className="auth-label">Username</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input has-trailing-action"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="auth-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="auth-label">Confirm password</label>
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>

            {error && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
