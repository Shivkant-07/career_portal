import React, { createContext, useContext, useState, useEffect } from "react";

// Predefined admin account (can be overridden via .env)
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin@123";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);

  // Keep admin logged in across page refreshes using localStorage
  useEffect(() => {
    const token = localStorage.getItem("cc_admin_token");
    if (token === "true") {
      setIsAdmin(true);
    }
  }, []);

  const login = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("cc_admin_token", "true");
      setIsAdmin(true);
      return { success: true };
    }
    return { success: false, message: "Invalid email or password." };
  };

  const logout = () => {
    localStorage.removeItem("cc_admin_token");
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
