import { useAuthStore } from "@/stores/authStore";
import { TokenPayload } from "@/types";

/**
 * Refresh the access token using the refresh token
 * @returns Promise with new token payload or null if refresh failed
 */
export async function refreshAccessToken(): Promise<TokenPayload | null> {
  const { refreshToken, updateTokens, logOut } = useAuthStore.getState();

  if (!refreshToken) {
    console.warn("[TokenManager] No refresh token available");
    return null;
  }

  try {
    console.log("[TokenManager] Refreshing access token...");

    const formData = {
      grant_type: "refresh_token",
      client_id: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || "",
      refresh_token: refreshToken,
    };

    const formBody = Object.entries(formData)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      }
    );

    if (!response.ok) {
      console.error("[TokenManager] Token refresh failed:", response.status);
      // If refresh token is invalid, logout the user
      if (response.status === 400 || response.status === 401) {
        console.warn("[TokenManager] Refresh token invalid, logging out");
        await logOut();
      }
      return null;
    }

    const payload: TokenPayload = await response.json();
    console.log("[TokenManager] Token refreshed successfully");

    // Update tokens in store
    updateTokens({
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresIn: payload.expires_in,
    });

    return payload;
  } catch (error) {
    console.error("[TokenManager] Error refreshing token:", error);
    return null;
  }
}

/**
 * Validate if the current token is valid and not expired
 * If expired, try to refresh it
 * @returns Promise<boolean> - true if token is valid or successfully refreshed
 */
export async function validateAndRefreshToken(): Promise<boolean> {
  const { accessToken, isTokenExpired } = useAuthStore.getState();

  // No token at all
  if (!accessToken) {
    console.warn("[TokenManager] No access token available");
    return false;
  }

  // Token is still valid
  if (!isTokenExpired()) {
    console.log("[TokenManager] Token is still valid");
    return true;
  }

  // Token is expired, try to refresh
  console.log("[TokenManager] Token expired, attempting refresh...");
  const newToken = await refreshAccessToken();

  return newToken !== null;
}

/**
 * Get the current valid access token
 * If expired, refresh it first
 * @returns Promise<string | null> - Access token or null if unavailable
 */
export async function getValidAccessToken(): Promise<string | null> {
  const isValid = await validateAndRefreshToken();

  if (!isValid) {
    console.warn("[TokenManager] Could not get valid access token");
    return null;
  }

  const { accessToken } = useAuthStore.getState();
  return accessToken;
}
