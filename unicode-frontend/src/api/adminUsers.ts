import { http } from "./http";

export type AdminUserRole = "ADMIN" | "USER";

export type AdminUserDto = {
  id: number;
  username: string;
  email: string;
  role: AdminUserRole;
  createdAt?: string | null;
};

export async function getAdminUsers(): Promise<AdminUserDto[]> {
  const res = await http.get<AdminUserDto[]>("/api/admin/users");
  return Array.isArray(res.data) ? res.data : [];
}

export async function updateAdminUserRole(id: number, role: AdminUserRole): Promise<AdminUserDto> {
  const res = await http.patch<AdminUserDto>(`/api/admin/users/${id}/role`, { role });
  return res.data;
}

export async function deleteAdminUser(id: number): Promise<void> {
  await http.delete(`/api/admin/users/${id}`);
}
