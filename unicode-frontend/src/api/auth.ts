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
  refreshToken?: string;
};

export type GoogleLoginRequest = {
  idToken: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const res = await http.post<AuthResponse>("/api/auth/login", data);
  return res.data;
}

export async function googleLoginApi(
  data: GoogleLoginRequest
): Promise<AuthResponse> {
  const res = await http.post<AuthResponse>("/api/auth/google", data);
  return res.data;
}

export async function registerApi(data: RegisterRequest): Promise<AuthResponse> {
  const res = await http.post<AuthResponse>("/api/auth/register", data);
  return res.data;
}

export async function refreshTokenApi(
  data: RefreshTokenRequest
): Promise<AuthResponse> {
  const res = await http.post<AuthResponse>("/api/auth/refresh", data);
  return res.data;
}

