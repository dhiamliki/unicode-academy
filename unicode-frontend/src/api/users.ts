import { http } from "./http";

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type CurrentUserDto = {
  username: string;
  email: string;
  role: "USER" | "ADMIN" | string;
  preferredLanguageCode?: string | null;
  preferredLanguageName?: string | null;
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

export async function getUsernames(): Promise<string[]> {
  const res = await http.get<string[]>("/api/users/usernames");
  return Array.isArray(res.data) ? res.data : [];
}

