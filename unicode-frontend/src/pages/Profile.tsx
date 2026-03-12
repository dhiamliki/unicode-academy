import { useEffect, useMemo, useState } from "react";
import { Upload, UserRound } from "lucide-react";
import { getProgressSummary, type ProgressSummaryDto } from "../api/progress";
import {
  getCurrentUser,
  getProgrammingLanguages,
  updatePreferredLanguage,
  uploadAvatar,
  type CurrentUserDto,
  type ProgrammingLanguageDto,
} from "../api/users";

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:8081").replace(/\/$/, "");

export default function Profile() {
  const [user, setUser] = useState<CurrentUserDto | null>(null);
  const [summary, setSummary] = useState<ProgressSummaryDto | null>(null);
  const [languages, setLanguages] = useState<ProgrammingLanguageDto[]>([]);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savingLanguage, setSavingLanguage] = useState(false);
  const [languageMessage, setLanguageMessage] = useState<string | null>(null);
  const [languageError, setLanguageError] = useState<string | null>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [me, progressSummary, languageList] = await Promise.all([
          getCurrentUser(),
          getProgressSummary(),
          getProgrammingLanguages(),
        ]);

        if (!cancelled) {
          setUser(me);
          setSummary(progressSummary);
          setLanguages(languageList);
          setSelectedLanguageCode(me.preferredLanguageCode ?? "");
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Echec du chargement du profil";
        if (!cancelled) {
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const correctRate = useMemo(() => {
    const totals = summary?.totals;
    if (!totals || totals.attemptedExercises === 0) return 0;
    return Math.round((totals.correctExercises * 100) / totals.attemptedExercises);
  }, [summary]);

  const avatarUrl = resolveAssetUrl(user?.avatarUrl);

  async function handlePreferredLanguageSave() {
    if (!selectedLanguageCode) {
      setLanguageError("Veuillez choisir une langue preferee.");
      setLanguageMessage(null);
      return;
    }

    setSavingLanguage(true);
    setLanguageError(null);
    setLanguageMessage(null);

    try {
      await updatePreferredLanguage(selectedLanguageCode);
      const selectedLanguage = languages.find((item) => item.code === selectedLanguageCode) ?? null;

      setUser((previous) =>
        previous
          ? {
              ...previous,
              preferredLanguageCode: selectedLanguageCode,
              preferredLanguageName:
                selectedLanguage?.name ?? previous.preferredLanguageName ?? selectedLanguageCode,
            }
          : previous
      );
      setLanguageMessage("Langue preferee mise a jour.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Echec de la mise a jour de la langue preferee";
      setLanguageError(msg);
    } finally {
      setSavingLanguage(false);
    }
  }

  async function handleAvatarUpload() {
    if (!avatarFile) {
      setAvatarError("Choisissez d'abord une image.");
      setAvatarMessage(null);
      return;
    }

    if (avatarFile.size > 5 * 1024 * 1024) {
      setAvatarError("L'avatar doit faire 5 Mo maximum.");
      setAvatarMessage(null);
      return;
    }

    setUploadingAvatar(true);
    setAvatarError(null);
    setAvatarMessage(null);

    try {
      const response = await uploadAvatar(avatarFile);
      setAvatarFile(null);
      setUser((previous) =>
        previous
          ? {
              ...previous,
              avatarUrl: response.avatarUrl ?? previous.avatarUrl,
            }
          : previous
      );
      setAvatarMessage("Avatar mis a jour.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Echec de l'envoi de l'avatar";
      setAvatarError(msg);
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="panel panel-hover p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Profil</h2>
            <p className="text-muted text-sm">Personnalisez votre profil et vos preferences d'apprentissage.</p>
          </div>
        </div>
      </div>

      {loading && <p className="text-muted text-sm">Chargement du profil...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && user && summary && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="panel panel-hover p-5">
            <h3 className="text-lg font-semibold text-slate-900">Compte</h3>

            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`Avatar de ${user.username}`}
                  className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-xl font-semibold text-teal-700">
                  {(user.username ?? "U").slice(0, 1).toUpperCase()}
                </div>
              )}

              <div className="flex min-w-[220px] flex-1 flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setAvatarFile(nextFile);
                    setAvatarError(null);
                    setAvatarMessage(null);
                  }}
                  className="field max-w-xs bg-white"
                />
                <button
                  type="button"
                  onClick={() => void handleAvatarUpload()}
                  disabled={uploadingAvatar || !avatarFile}
                  className="btn-primary gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingAvatar ? "Envoi..." : "Envoyer l'avatar"}
                </button>
              </div>
            </div>

            {avatarError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {avatarError}
              </p>
            )}
            {avatarMessage && (
              <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-700">
                {avatarMessage}
              </p>
            )}

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-900">Nom d'utilisateur :</span> {user.username}
              </p>
              <p>
                <span className="font-medium text-slate-900">E-mail :</span> {user.email}
              </p>
              <p>
                <span className="font-medium text-slate-900">Role :</span> {user.role}
              </p>
              <p>
                <span className="font-medium text-slate-900">Langue preferee :</span>{" "}
                {user.preferredLanguageName
                  ? `${user.preferredLanguageName} (${user.preferredLanguageCode ?? "-"})`
                  : "Non definie"}
              </p>
            </div>
          </section>

          <section className="panel panel-hover p-5">
            <h3 className="text-lg font-semibold text-slate-900">Preferences</h3>
            <p className="mt-1 text-sm text-slate-600">Choisissez votre langue preferee pour les recommandations.</p>

            <div className="mt-4 space-y-3">
              <select
                value={selectedLanguageCode}
                onChange={(event) => {
                  setSelectedLanguageCode(event.target.value);
                  setLanguageError(null);
                  setLanguageMessage(null);
                }}
                className="field"
              >
                <option value="">Selectionner une langue</option>
                {languages.map((language) => (
                  <option key={language.id} value={language.code}>
                    {language.name} ({language.code})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void handlePreferredLanguageSave()}
                disabled={savingLanguage || !selectedLanguageCode}
                className="btn-primary"
              >
                {savingLanguage ? "Enregistrement..." : "Enregistrer la langue preferee"}
              </button>

              {languageError && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {languageError}
                </p>
              )}
              {languageMessage && (
                <p className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-700">
                  {languageMessage}
                </p>
              )}
            </div>
          </section>

          <section className="panel panel-hover p-5 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900">Statistiques</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Metric label="Cours termines" value={summary.totals.completedCourses} />
              <Metric label="Lecons terminees" value={summary.totals.completedLessons} />
              <Metric label="Tentatives d'exercice" value={summary.totals.attemptedExercises} />
              <Metric label="Exercices corrects" value={summary.totals.correctExercises} />
            </div>

            <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3">
              <p className="text-xs uppercase tracking-wide text-teal-600">Taux de reussite</p>
              <p className="mt-1 text-xl font-semibold text-teal-800">{correctRate}%</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

type MetricProps = {
  label: string;
  value: number;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[#FAFCFF] p-3">
      <p className="text-muted text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function resolveAssetUrl(url: string | null | undefined) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${apiBaseUrl}${url}`;
  }
  return `${apiBaseUrl}/${url}`;
}
