import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI, getErrorMessage } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    try {
      if (token && savedUser) {
        const session = JSON.parse(savedUser);
        if (typeof session?.isAdmin !== "boolean")
          throw new Error("Sign in to refresh your session.");
        setUser(session);
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setLoading(false);
    const clearSession = () => setUser(null);
    const syncSession = (event) => {
      if (event.key === "token" && !event.newValue) clearSession();
    };
    window.addEventListener("auth:expired", clearSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener("auth:expired", clearSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, client } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(client));
      setUser(client);

      return { success: true, client };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Unable to sign in. Please try again."),
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, client } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(client));
      setUser(client);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(
          error,
          "Unable to create your account. Please try again.",
        ),
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
