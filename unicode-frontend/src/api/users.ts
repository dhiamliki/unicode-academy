import { http } from "./http";

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type CurrentUserDto = {
  username: string;
  email: string;
  role: "USER" | "ADMIN" | string;
  avatarUrl?: string | null;
  preferredLanguageCode?: string | null;
  preferredLanguageName?: string | null;
};

export type ProgrammingLanguageDto = {
  id: number;
  code: string;
  name: string;
};

export type UserPreferenceResponse = {
  languageCode?: string | null;
};

export async function changePassword(
  data: ChangePasswordRequest
): Promise<void> {
  await http.put("/api/users/change-password", data);
}

export async function deleteMyAccount(): Promise<void> {
  await http.delete("/api/users/me");
}

export async function getCurrentUser(): Promise<CurrentUserDto> {
  const res = await http.get<CurrentUserDto>("/api/users/me");
  return res.data;
}

export async function getProgrammingLanguages(): Promise<ProgrammingLanguageDto[]> {
  const res = await http.get<ProgrammingLanguageDto[]>("/api/languages");
  return Array.isArray(res.data) ? res.data : [];
}

export async function updatePreferredLanguage(
  languageCode: string
): Promise<UserPreferenceResponse> {
  const res = await http.post<UserPreferenceResponse>("/api/users/me/preference", {
    languageCode,
  });
  return res.data;
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await http.post<{ avatarUrl?: string }>("/api/users/me/avatar", formData, {
    transformRequest: (data) => data,
    headers: { "Content-Type": undefined as unknown as string },
  });
  return res.data ?? {};
}

export async function getUsernames(): Promise<string[]> {
  const res = await http.get<string[]>("/api/users/usernames");
  return Array.isArray(res.data) ? res.data : [];
}

