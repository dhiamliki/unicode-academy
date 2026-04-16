import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import AppShell from "./components/AppShell";
import { getCurrentUser } from "./api/users";
import { getToken } from "./auth/session";
import { queryKeys } from "./lib/queryKeys";
import AdminPage from "./pages/AdminPage";
import AccueilPage from "./pages/AccueilPage";
import ApprendrePage from "./pages/ApprendrePage";
import ChatPage from "./pages/ChatPage";
import ClassementPage from "./pages/ClassementPage";
import CoursPathPage from "./pages/CoursPathPage";
import ExercicesPage from "./pages/ExercicesPage";
import LeconPage from "./pages/LeconPage";
import LoginPage from "./pages/LoginPage";
import ParametresPage from "./pages/ParametresPage";
import ProfilPage from "./pages/ProfilPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <RegisterPage />
            </PublicOnly>
          }
        />
        <Route
          path="/apprendre/:courseId/:unitId/lecon"
          element={
            <ProtectedFullscreen>
              <LeconPage />
            </ProtectedFullscreen>
          }
        />
        <Route
          path="/apprendre/:courseId/:unitId/:lessonId"
          element={
            <ProtectedFullscreen>
              <LeconPage />
            </ProtectedFullscreen>
          }
        />
        <Route
          path="/apprendre/:courseId/:unitId/exercices"
          element={
            <ProtectedFullscreen>
              <ExercicesPage />
            </ProtectedFullscreen>
          }
        />
        <Route
          element={<ProtectedShell />}
        >
          <Route path="/accueil" element={<AccueilPage />} />
          <Route path="/apprendre" element={<ApprendrePage />} />
          <Route path="/apprendre/:courseId" element={<CoursPathPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/classement" element={<ClassementPage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/parametres" element={<ParametresPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminPage />
            </ProtectedAdmin>
          }
        />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function RootRedirect() {
  return <Navigate to={getToken() ? "/accueil" : "/login"} replace />;
}

function PublicOnly({ children }: { children: ReactNode }) {
  if (getToken()) {
    return <Navigate to="/accueil" replace />;
  }

  return <>{children}</>;
}

function ProtectedShell() {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function ProtectedFullscreen({ children }: { children: ReactNode }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function ProtectedAdmin({ children }: { children: ReactNode }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  if (currentUserQuery.isLoading) {
    return (
      <div className="page">
        <div className="card content-section">
          <div className="page-stack">
            <span className="section-kicker">Administration</span>
            <h1 className="section-title">Vérification des accès…</h1>
            <p className="text-muted">
              Nous confirmons ton rôle avant d&apos;ouvrir l&apos;espace d&apos;administration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if ((currentUserQuery.data?.role ?? "").toUpperCase() !== "ADMIN") {
    return <Navigate to="/accueil" replace />;
  }

  return <>{children}</>;
}
