"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthAPI, ProfileAPI } from "../lib/api";
import { AuthUser } from "../types";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  initializing: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: { fullName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "cloud-drive-token";
const USER_KEY = "cloud-drive-user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = window.localStorage.getItem(TOKEN_KEY);
      const storedUser = window.localStorage.getItem(USER_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser) as AuthUser);
    }
  }, []);
  useEffect(() => {
    if (!token || user) {
      return;
    }

    let cancelled = false;

    ProfileAPI.me(token)
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        window.localStorage.setItem(USER_KEY, JSON.stringify(profile));
      })
      .catch((error) => {
        if (cancelled) return;
        setToken(null);
        window.localStorage.removeItem(TOKEN_KEY);
        console.error("Failed to hydrate profile", error);
      });

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const initializing = Boolean(token && !user);

  const persist = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const clear = useCallback(() => {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }, []);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const result = await AuthAPI.login(payload);
      persist(result.token, result.user);
    },
    [persist]
  );

  const signup = useCallback(
    async (payload: { fullName: string; email: string; password: string }) => {
      const result = await AuthAPI.signup(payload);
      persist(result.token, result.user);
    },
    [persist]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const profile = await ProfileAPI.me(token);
    setUser(profile);
    window.localStorage.setItem(USER_KEY, JSON.stringify(profile));
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initializing,
      login,
      signup,
      logout: clear,
      refreshProfile,
    }),
    [user, token, initializing, login, signup, clear, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

