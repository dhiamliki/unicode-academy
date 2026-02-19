import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { loginApi } from "../api/auth";
import { http } from "../api/http";
import { setToken } from "../auth/session";
import "../styles/public-pages.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
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
        "Login failed";
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
          <h1>Welcome back to your learning workspace.</h1>
          <p>
            Continue courses, review progress, join live discussions, and stay on top of leaderboard
            goals.
          </p>
          <ul>
            <li>Structured course roadmap per language</li>
            <li>Real-time chat with peers and instructors</li>
            <li>Progress snapshots and completion metrics</li>
          </ul>
        </section>

        <section className="auth-form-card">
          <p className="landing-kicker" style={{ color: "#0f766e" }}>Login</p>
          <h2 className="auth-form-title">Sign in to UniCode</h2>

          <form onSubmit={onSubmit} className="auth-form">
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
                  placeholder="Enter password"
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

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {error && <p className="auth-error">{error}</p>}
          </form>

          <div className="auth-google">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (!credentialResponse.credential) {
                  setError("Google login failed");
                  return;
                }

                try {
                  const decoded: any = jwtDecode(credentialResponse.credential);
                  const response = await http.post("/api/auth/google", {
                    email: decoded.email,
                    name: decoded.name,
                    googleId: decoded.sub,
                  });
                  setToken(response.data.token);
                  nav("/dashboard", { replace: true });
                } catch (err: any) {
                  const msg =
                    err?.response?.data?.message ??
                    (typeof err?.response?.data === "string" ? err.response.data : null) ??
                    "Google login failed";
                  setError(msg);
                }
              }}
              onError={() => setError("Google login failed")}
            />
          </div>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
