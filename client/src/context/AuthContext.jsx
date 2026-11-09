import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { setStorageUser } from "../storage/db";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/api/auth/me")
      .then((data) => {
        setStorageUser(data.user.id);
        setUser(data.user);
      })
      .catch(() => {
        setStorageUser(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setStorageUser(data.user.id);
    setUser(data.user);
  };
  const register = async (name, email, password) => {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setStorageUser(data.user.id);
    setUser(data.user);
  };
  const logout = async () => {
    await api("/api/auth/logout", { method: "POST", body: "{}" });
    setStorageUser(null);
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
