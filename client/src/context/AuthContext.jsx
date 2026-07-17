import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import apiClient from "../api/apiClient.js";

import {
  getStoredToken,
  removeStoredToken,
  storeToken,
} from "../utils/authStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] =
    useState(true);

  const clearAuthentication = useCallback(() => {
    removeStoredToken();
    setUser(null);
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      setUser(null);
      setIsInitializing(false);
      return;
    }

    try {
      const response = await apiClient.get("/auth/me");

      setUser(response.data.data.user);
    } catch {
      clearAuthentication();
    } finally {
      setIsInitializing(false);
    }
  }, [clearAuthentication]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    function handleUnauthorized() {
      clearAuthentication();
    }

    window.addEventListener(
      "b-hive:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "b-hive:unauthorized",
        handleUnauthorized
      );
    };
  }, [clearAuthentication]);

  async function register(credentials) {
    const response = await apiClient.post(
      "/auth/register",
      credentials
    );

    const {
      token,
      user: registeredUser,
    } = response.data.data;

    storeToken(token);
    setUser(registeredUser);

    return registeredUser;
  }

  async function login(credentials) {
    const response = await apiClient.post(
      "/auth/login",
      credentials
    );

    const {
      token,
      user: authenticatedUser,
    } = response.data.data;

    storeToken(token);
    setUser(authenticatedUser);

    return authenticatedUser;
  }

  function logout() {
    clearAuthentication();
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      register,
      login,
      logout,
      refreshUser: loadCurrentUser,
    }),
    [
      user,
      isInitializing,
      loadCurrentUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}