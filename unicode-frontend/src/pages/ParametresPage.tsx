import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  changePassword,
  deleteMyAccount,
  getCurrentUser,
  getProgrammingLanguages,
  updatePreferredLanguage,
} from "../api/users";
import { endAuthenticatedSession } from "../auth/authState";
import ConfirmModal from "../components/ConfirmModal";
import { queryKeys } from "../lib/queryKeys";
import { getErrorMessage } from "../utils/errorMessage";

export default function ParametresPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  const languagesQuery = useQuery({
    queryKey: ["programmingLanguages"],
    queryFn: getProgrammingLanguages,
  });

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  useEffect(() => {
    const firstError = currentUserQuery.error ?? languagesQuery.error;
    if (firstError) {
      toast.error(getErrorMessage(firstError, "Impossible de charger les parametres."));
    }
  }, [currentUserQuery.error, languagesQuery.error]);

  useEffect(() => {
    if (!currentUserQuery.data) {
      return;
    }

    setSelectedLanguage(currentUserQuery.data.preferredLanguageCode ?? "");
  }, [currentUserQuery.data]);

  async function handleLanguageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedLanguage = selectedLanguage.trim();
    if (!normalizedLanguage) {
      toast.error("Choisis un langage a enregistrer.");
      return;
    }

    if (
      normalizedLanguage.toLowerCase() ===
      (currentUserQuery.data?.preferredLanguageCode ?? "").trim().toLowerCase()
    ) {
      toast("Aucun changement a enregistrer.");
      return;
    }

    setIsSavingLanguage(true);
    try {
      await updatePreferredLanguage(normalizedLanguage);
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: queryKeys.currentUser }),
        queryClient.refetchQueries({ queryKey: queryKeys.currentUser, exact: true, type: "active" }),
      ]);
      toast.success("Langage prefere mis a jour.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Impossible d'enregistrer le langage prefere."));
    } finally {
      setIsSavingLanguage(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      toast.error("Tous les champs du mot de passe sont obligatoires.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (passwordStrength.score < 2) {
      toast.error("Choisis un mot de passe plus solide.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("Mot de passe mis a jour.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Impossible de mettre a jour le mot de passe."));
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (isDeletingAccount) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteMyAccount();
      endAuthenticatedSession();
      navigate("/login", { replace: true });
      toast.success("Compte supprime.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Impossible de supprimer le compte."));
    } finally {
      setIsDeletingAccount(false);
      setDeleteModalOpen(false);
    }
  }

  if (currentUserQuery.isLoading || !currentUserQuery.data) {
    return (
      <div className="page page-stack">
        <section className="card content-section">
          <div className="page-stack">
            <p className="section-kicker">Parametres</p>
            <h1 className="section-title">Chargement du compte</h1>
            <p className="text-muted">Nous recuperons ton profil, ta securite et tes reglages utiles.</p>
          </div>
        </section>
      </div>
    );
  }

  const user = currentUserQuery.data;
  const languageOptions = languagesQuery.data ?? [];
  const currentLanguageLabel =
    languageOptions.find(
      (language) =>
        language.code.trim().toLowerCase() ===
        (user.preferredLanguageCode ?? "").trim().toLowerCase()
    )?.name ??
    user.preferredLanguageName ??
    "Aucun langage defini";

  return (
    <div className="page page-stack">
      <section className="card content-section fu">
        <div className="page-stack" style={{ gap: 8 }}>
          <p className="section-kicker">Compte</p>
          <h1 className="section-title">Parametres</h1>
          <p className="text-muted">
            Gere uniquement ce qui a un effet reel sur ton compte, ton acces et ton parcours
            d'apprentissage.
          </p>
        </div>
      </section>

      <section
        className="page-stack"
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
        }}
      >
        <div className="page-stack">
          <article className="card content-section fu fu1">
            <div className="section-head">
              <div>
                <p className="section-kicker">Compte</p>
                <h2 className="section-title">Informations du profil</h2>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/profil")}>
                Voir le profil
              </button>
            </div>

            <div className="page-stack" style={{ gap: 14, marginTop: 12 }}>
              <div>
                <span className="field-label">Pseudo</span>
                <input className="field" value={user.username} disabled readOnly />
              </div>
              <div>
                <span className="field-label">Email</span>
                <input className="field" value={user.email ?? ""} disabled readOnly />
              </div>
              <div>
                <span className="field-label">Role</span>
                <input
                  className="field"
                  value={user.role === "ADMIN" ? "Administrateur" : "Etudiant"}
                  disabled
                  readOnly
                />
              </div>
            </div>
          </article>

          <article className="card content-section fu fu2">
            <div className="page-stack" style={{ gap: 8 }}>
              <div>
                <p className="section-kicker">Apprentissage</p>
                <h2 className="section-title">Langage prefere</h2>
              </div>
              <p className="text-muted">
                Ce choix est utilise pour ouvrir en priorite le bon parcours dans l'espace
                d'apprentissage.
              </p>
            </div>

            <form className="page-stack" style={{ gap: 12, marginTop: 16 }} onSubmit={handleLanguageSubmit}>
              <div>
                <label htmlFor="settings-preferred-language" className="field-label">
                  Langage
                </label>
                <select
                  id="settings-preferred-language"
                  className="field"
                  value={selectedLanguage}
                  onChange={(event) => setSelectedLanguage(event.target.value)}
                  disabled={languagesQuery.isLoading || languageOptions.length === 0}
                >
                  <option value="">
                    {languagesQuery.isLoading ? "Chargement..." : "Choisir un langage"}
                  </option>
                  {languageOptions.map((language) => (
                    <option key={language.id} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-muted">
                Langage actuel: <strong>{currentLanguageLabel}</strong>
              </p>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSavingLanguage || languagesQuery.isLoading || languageOptions.length === 0}
              >
                {isSavingLanguage ? "Enregistrement..." : "Enregistrer le langage"}
              </button>
            </form>
          </article>
        </div>

        <div className="page-stack">
          <article className="card content-section fu fu3">
            <div className="page-stack" style={{ gap: 8 }}>
              <div>
                <p className="section-kicker">Securite</p>
                <h2 className="section-title">Mot de passe</h2>
              </div>
              <p className="text-muted">Met a jour ton acces sans ajouter de reglages fictifs autour.</p>
            </div>

            <form className="page-stack" style={{ gap: 12, marginTop: 16 }} onSubmit={handlePasswordSubmit}>
              <div>
                <label htmlFor="settings-current-password" className="field-label">
                  Mot de passe actuel
                </label>
                <input
                  id="settings-current-password"
                  className="field"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="settings-new-password" className="field-label">
                  Nouveau mot de passe
                </label>
                <input
                  id="settings-new-password"
                  className="field"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="settings-confirm-password" className="field-label">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  id="settings-confirm-password"
                  className="field"
                  type="password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                />
              </div>
              <p className="text-muted" style={{ marginTop: -2 }}>
                Solidite: <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
              </p>
              <button type="submit" className="btn btn-primary btn-full" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? "Mise a jour..." : "Changer le mot de passe"}
              </button>
            </form>
          </article>

          <article className="card content-section fu fu4">
            <div className="page-stack" style={{ gap: 10 }}>
              <div>
                <p className="section-kicker">Session</p>
                <h2 className="section-title">Acces au compte</h2>
              </div>
              <p className="text-muted">
                Ferme la session sur cet appareil ou supprime definitivement ton compte.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-full"
              style={{ marginTop: 16 }}
              onClick={() => {
                endAuthenticatedSession();
                navigate("/login", { replace: true });
              }}
            >
              Se deconnecter
            </button>

            <button
              type="button"
              className="btn btn-danger btn-full"
              style={{ marginTop: 12 }}
              onClick={() => setDeleteModalOpen(true)}
            >
              Supprimer mon compte
            </button>
          </article>
        </div>
      </section>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Supprimer le compte ?"
        message="Cette action est definitive. Ton profil, ta progression et ton acces seront supprimes."
        confirmLabel={isDeletingAccount ? "Suppression..." : "Supprimer mon compte"}
        dangerous
        onConfirm={() => void handleDeleteAccount()}
        onCancel={() => {
          if (!isDeletingAccount) {
            setDeleteModalOpen(false);
          }
        }}
      />
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
