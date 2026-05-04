/**
 * context/AuthContext.jsx
 * Provides authentication state and actions throughout the app.
 * Persists token + user info in localStorage.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("rbg_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true); // loading initial auth check

  // ─── Persist user to localStorage whenever it changes ─────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem("rbg_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("rbg_user");
    }
  }, [user]);

  // ─── On mount: verify token is still valid & refresh user data ────────────
  useEffect(() => {
    const token = localStorage.getItem("rbg_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Token invalid — clear everything
        localStorage.removeItem("rbg_token");
        localStorage.removeItem("rbg_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem("rbg_token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("rbg_token");
    localStorage.removeItem("rbg_user");
    setUser(null);
  }, []);

  /** Call this after a successful remove-bg to update credit count in UI */
  const updateCredits = useCallback((newCredits) => {
    setUser((prev) => (prev ? { ...prev, credits: newCredits } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateCredits }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
