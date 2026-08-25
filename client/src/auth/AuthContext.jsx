import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

const TOKEN_KEY = "threadline_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authed | anon

  async function refresh() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setStatus("anon");
      return;
    }
    try {
      const { user } = await api.get("/api/auth/me");
      setUser(user);
      setStatus("authed");
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setStatus("anon");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function login(token) {
    localStorage.setItem(TOKEN_KEY, token);
    return refresh();
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus("anon");
  }

  function updateUser(partial) {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout, refresh, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
