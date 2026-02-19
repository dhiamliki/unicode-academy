import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  CircleHelp,
  MessageSquareText,
  Trophy,
  UsersRound,
  Zap,
} from "lucide-react";
import { clearAuth, getToken } from "../auth/session";
import "../styles/public-pages.css";

const features = [
  {
    title: "Progress Tracking",
    description: "See completed lessons, course milestones, and quiz performance in one dashboard.",
    icon: BarChart3,
  },
  {
    title: "Quizzes",
    description: "Validate your knowledge with checkpoints and final quiz rounds per track.",
    icon: CircleHelp,
  },
  {
    title: "Leaderboard",
    description: "Stay motivated with real-time rankings based on lessons and accuracy.",
    icon: Trophy,
  },
  {
    title: "Live Chat",
    description: "Collaborate in global and course rooms to unblock faster.",
    icon: MessageSquareText,
  },
];

const quickStats = [
  { value: "120+", label: "Guided lessons" },
  { value: "95%", label: "Quiz completion rate" },
  { value: "24/7", label: "Live peer support" },
];

const momentumCards = [
  {
    title: "Structured Paths",
    description: "Move from fundamentals to advanced projects through role-based tracks.",
    icon: BookOpenCheck,
  },
  {
    title: "Team Momentum",
    description: "Use leaderboards and rooms to keep accountability visible and motivating.",
    icon: UsersRound,
  },
  {
    title: "Fast Feedback Loops",
    description: "Quiz checkpoints and progress trends show exactly where to focus next.",
    icon: Zap,
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const isSignedIn = Boolean(getToken());

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <div className="public-root">
      <div className="public-frame">
        <header className="landing-topbar">
          <Link to="/" className="public-brand">
            <span className="public-brand-mark">U</span>
            <span>UniCode</span>
          </Link>

          <div className="landing-top-actions">
            {isSignedIn ? (
              <>
                <Link to="/dashboard" className="public-btn public-btn-primary">
                  Go to dashboard
                </Link>
                <button type="button" className="public-btn public-btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="public-btn public-btn-primary">
                  Get started
                </Link>
                <Link to="/login" className="public-btn public-btn-secondary">
                  Login
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="landing-main">
          <section className="landing-hero">
            <p className="landing-kicker">Modern Learning Workspace</p>
            <h1 className="landing-title">Learn faster with structure, feedback, and community.</h1>
            <p className="landing-subtitle">
              UniCode combines guided courses, progress analytics, quizzes, leaderboard competition,
              and real-time chat in one production-ready learning platform.
            </p>

            <div className="landing-actions">
              {isSignedIn ? (
                <Link to="/dashboard" className="public-btn public-btn-primary">
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="public-btn public-btn-primary">
                    Get started
                  </Link>
                  <Link to="/login" className="public-btn public-btn-secondary">
                    Login
                  </Link>
                </>
              )}
            </div>

            <div className="landing-stats">
              {quickStats.map((stat) => (
                <article key={stat.label} className="landing-stat">
                  <p className="landing-stat-value">{stat.value}</p>
                  <p className="landing-stat-label">{stat.label}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="landing-side">
            <h2>Everything you need in one place</h2>
            <p>Built for students and instructors who want clear progress and practical collaboration.</p>

            <div className="landing-feature-grid">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="landing-feature">
                    <span className="landing-feature-icon">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </aside>
        </main>

        <section className="landing-momentum">
          <div className="landing-momentum-copy">
            <p className="landing-kicker landing-kicker-soft">Built for consistent progress</p>
            <h2>Stay accountable without leaving your learning flow.</h2>
            <p>
              Keep lessons, rankings, checkpoints, and collaboration in one connected workspace so
              you spend more time learning and less time switching tools.
            </p>
          </div>

          <div className="landing-momentum-grid">
            {momentumCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="landing-momentum-card">
                  <span className="landing-momentum-icon">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="landing-footer">
          <span>(c) {new Date().getFullYear()} UniCode. All rights reserved.</span>
          <Link to={isSignedIn ? "/dashboard" : "/register"}>
            {isSignedIn ? "Open workspace" : "Create account"}
          </Link>
        </footer>
      </div>
    </div>
  );
}


