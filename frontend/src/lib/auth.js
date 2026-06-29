import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = checking, false = unauth, object = authed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // httpOnly cookies are not visible to JS — we always probe /auth/me on mount.
    // For unauthenticated visitors this is one 401 (cheap).
    api.get("/auth/me")
      .then((r) => { if (mounted) setUser(r.data); })
      .catch(() => { if (mounted) setUser(false); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // Backend sets access_token + refresh_token as httpOnly cookies.
    // We no longer keep the JWT in localStorage.
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // logout is best-effort; if the network call fails we still clear local state
      console.warn("Logout request failed:", e?.message || e);
    }
    setUser(false);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
