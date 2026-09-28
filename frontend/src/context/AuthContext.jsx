import React, {
  createContext,
  useContext,
  useState,
} from "react";

import {
  registerUser,
  loginUser,
} from "../services/api";

// Predefined admin account
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@gmail.com";
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin@123";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Synchronously initialize from localStorage so page refreshes don't flicker or redirect
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem("cc_admin_token") === "true"
  );

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("cc_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Admin Login
  const adminLogin = (email, password) => {
    const normalizedEmail = (email || "").trim().toLowerCase();
    if (
      normalizedEmail === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      localStorage.setItem("cc_admin_token", "true");
      setIsAdmin(true);

      return { success: true };
    }

    return {
      success: false,
      message: "Invalid admin email or password.",
    };
  };

  // User Register
  const register = async (userData) => {
    const response = await registerUser(userData);

    return response;
  };

  // User Login
  const userLogin = async (credentials) => {
    const response = await loginUser(credentials);

    localStorage.setItem("cc_user_token", response.token);
    localStorage.setItem("cc_user", JSON.stringify(response.user));

    setUser(response.user);

    return response;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("cc_admin_token");
    localStorage.removeItem("cc_user_token");
    localStorage.removeItem("cc_user");

    setIsAdmin(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        user,
        adminLogin,
        register,
        userLogin,
        logout,
        login: adminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
