import { queryClient } from "../lib/queryClient";
import { clearAuth, setAuthTokens } from "./session";

export function beginAuthenticatedSession(token: string, refreshToken?: string) {
  queryClient.clear();
  setAuthTokens(token, refreshToken);
}

export function endAuthenticatedSession() {
  clearAuth();
  queryClient.clear();
}
