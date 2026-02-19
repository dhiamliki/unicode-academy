import { http } from "./http";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const res = await http.post<AuthResponse>("/api/auth/login", data);
  return res.data;
}

export async function registerApi(data: RegisterRequest): Promise<string> {
  const res = await http.post<string>("/api/auth/register", data, {
    responseType: "text",
  });
  return typeof res.data === "string" ? res.data : "";
}

