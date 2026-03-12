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
    title: "Suivi de progression",
    description: "Consultez les lecons terminees, les etapes de cours et les resultats des quiz dans un seul tableau de bord.",
    icon: BarChart3,
  },
  {
    title: "Quiz",
    description: "Validez vos connaissances avec des checkpoints et un quiz final par parcours.",
    icon: CircleHelp,
  },
  {
    title: "Classement",
    description: "Restez motive avec un classement en temps reel base sur les lecons et la precision.",
    icon: Trophy,
  },
  {
    title: "Chat en direct",
    description: "Collaborez dans les salons globaux et de cours pour avancer plus vite.",
    icon: MessageSquareText,
  },
];

const quickStats = [
  { value: "120+", label: "Lecons guidees" },
  { value: "95%", label: "Taux de completion des quiz" },
  { value: "24/7", label: "Support entre pairs en direct" },
];

const momentumCards = [
  {
    title: "Parcours structures",
    description: "Passez des bases aux projets avances grace a des parcours adaptes aux roles.",
    icon: BookOpenCheck,
  },
  {
    title: "Dynamique d'equipe",
    description: "Utilisez le classement et les salons pour garder une motivation visible.",
    icon: UsersRound,
  },
  {
    title: "Feedback rapide",
    description: "Les checkpoints de quiz et tendances de progression montrent ou se concentrer ensuite.",
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
                  Aller au tableau de bord
                </Link>
                <button type="button" className="public-btn public-btn-danger" onClick={handleLogout}>
                  Deconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="public-btn public-btn-primary">
                  Commencer
                </Link>
                <Link to="/login" className="public-btn public-btn-secondary">
                  Connexion
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="landing-main">
          <section className="landing-hero">
            <p className="landing-kicker">Espace d'apprentissage moderne</p>
            <h1 className="landing-title">Apprenez plus vite avec structure, feedback et communaute.</h1>
            <p className="landing-subtitle">
              UniCode combine des cours guides, l'analyse de progression, des quiz, un classement
              competitif et le chat en temps reel dans une plateforme prete pour la production.
            </p>

            <div className="landing-actions">
              {isSignedIn ? (
                <Link to="/dashboard" className="public-btn public-btn-primary">
                  Aller au tableau de bord
                </Link>
              ) : (
                <>
                  <Link to="/register" className="public-btn public-btn-primary">
                    Commencer
                  </Link>
                  <Link to="/login" className="public-btn public-btn-secondary">
                    Connexion
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
            <h2>Tout ce qu'il faut au meme endroit</h2>
            <p>Concu pour les apprenants et formateurs qui veulent une progression claire et une collaboration pratique.</p>

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
            <p className="landing-kicker landing-kicker-soft">Concu pour progresser regulierement</p>
            <h2>Restez responsable sans quitter votre flux d'apprentissage.</h2>
            <p>
              Gardez les lecons, le classement, les checkpoints et la collaboration dans un seul
              espace connecte pour passer plus de temps a apprendre.
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
          <span>(c) {new Date().getFullYear()} UniCode. Tous droits reserves.</span>
          <Link to={isSignedIn ? "/dashboard" : "/register"}>
            {isSignedIn ? "Ouvrir l'espace" : "Creer un compte"}
          </Link>
        </footer>
      </div>
    </div>
  );
}


