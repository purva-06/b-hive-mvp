const AUTH_TOKEN_KEY = "b_hive_auth_token";

function isLocalStorageAvailable() {
  try {
    return typeof window !== "undefined" &&
      window.localStorage;
  } catch {
    return false;
  }
}

export function getStoredToken() {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  const token = window.localStorage.getItem(
    AUTH_TOKEN_KEY
  );

  return token?.trim() || null;
}

export function storeToken(token) {
  if (!isLocalStorageAvailable()) {
    return;
  }

  const normalizedToken =
    typeof token === "string"
      ? token.trim()
      : "";

  if (!normalizedToken) {
    removeStoredToken();
    return;
  }

  window.localStorage.setItem(
    AUTH_TOKEN_KEY,
    normalizedToken
  );
}

export function removeStoredToken() {
  if (!isLocalStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(
    AUTH_TOKEN_KEY
  );
}