import { useEffect, useState } from "react";
import { ShieldAlert, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { changePassword, deleteMyAccount } from "../api/users";
import { clearAuth } from "../auth/session";
import { useToast } from "../components/ToastProvider";

export default function Account() {
  const nav = useNavigate();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [showChangeForm, setShowChangeForm] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!showDeleteModal) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowDeleteModal(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showDeleteModal]);

  function toggleChangeForm() {
    setShowChangeForm((prev) => {
      const next = !prev;
      if (!next) {
        setPwError(null);
        setPwSuccess(null);
      }
      return next;
    });
  }

  async function submitPasswordChange(event: React.FormEvent) {
    event.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwError("Tous les champs sont requis.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setPwLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPwSuccess("Mot de passe mis a jour.");
      showToast({ type: "success", message: "Mot de passe mis a jour." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Echec de la mise a jour du mot de passe.";
      setPwError(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setPwLoading(false);
    }
  }

  async function confirmAndDelete() {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteMyAccount();
      clearAuth();
      showToast({ type: "success", message: "Compte supprime." });
      nav("/login", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Suppression du compte echouee.";
      setDeleteError(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <UserCog className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Mon compte</h2>
            <p className="text-sm text-slate-600">Manage password and account security settings.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel p-5">
          <h3 className="text-lg font-semibold text-slate-900">Changer le mot de passe</h3>
          <p className="mt-1 text-sm text-slate-600">Mettez a jour votre mot de passe en toute securite.</p>

          <button type="button" onClick={toggleChangeForm} className="btn-secondary mt-4">
            {showChangeForm ? "Masquer le formulaire" : "Changer le mot de passe"}
          </button>

          {showChangeForm && (
            <form onSubmit={submitPasswordChange} className="mt-4 space-y-3">
              <input
                placeholder="Mot de passe actuel"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="field"
              />
              <input
                placeholder="Nouveau mot de passe"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="field"
              />
              <input
                placeholder="Confirmer le nouveau mot de passe"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                className="field"
              />

              <button type="submit" disabled={pwLoading} className="btn-primary">
                {pwLoading ? "Mise a jour..." : "Mettre a jour"}
              </button>

              {pwError && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-700">
                  {pwSuccess}
                </p>
              )}
            </form>
          )}
        </section>

        <section className="panel border-red-200 bg-red-50/60 p-5">
          <div className="flex items-center gap-2 text-red-700">
            <ShieldAlert className="h-4 w-4" />
            <h3 className="text-lg font-semibold">Supprimer le compte</h3>
          </div>
          <p className="mt-1 text-sm text-red-700/90">
            Cette action supprime definitivement votre compte et vos donnees.
          </p>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteLoading}
            className="btn-danger mt-4"
          >
            {deleteLoading ? "Suppression..." : "Supprimer mon compte"}
          </button>

          {deleteError && (
            <p className="mt-3 rounded-lg border border-red-200 bg-white p-3 text-sm text-red-700">
              {deleteError}
            </p>
          )}
        </section>
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-panel">
            <h4 className="text-lg font-semibold text-slate-900">Supprimer le compte</h4>
            <p className="mt-2 text-sm text-slate-600">
              Etes-vous sur de vouloir supprimer votre compte ? Cette action est irreversible.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn-secondary">
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmAndDelete}
                disabled={deleteLoading}
                className="btn-danger"
              >
                {deleteLoading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

