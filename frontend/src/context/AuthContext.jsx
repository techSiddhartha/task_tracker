import { createContext, useContext, useEffect, useState } from "react";

import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ttm_token");

    if (!token) {
      setLoading(false);
      return;
    }

    const bootstrapAuth = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("ttm_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (values) => {
    const { data } = await api.post("/auth/login", values);
    localStorage.setItem("ttm_token", data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (values) => {
    const { data } = await api.post("/auth/signup", values);
    localStorage.setItem("ttm_token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("ttm_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
