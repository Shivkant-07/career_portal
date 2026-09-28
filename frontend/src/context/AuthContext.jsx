import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  registerUser,
  loginUser,
} from "../services/api";

// Predefined admin account
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin@123";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  // Restore login after page refresh
  useEffect(() => {
    const adminToken = localStorage.getItem("cc_admin_token");
    const userToken = localStorage.getItem("cc_user_token");
    const savedUser = localStorage.getItem("cc_user");

    if (adminToken === "true") {
      setIsAdmin(true);
    }

    if (userToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("cc_user");
        localStorage.removeItem("cc_user_token");
      }
    }
  }, []);

  // Admin Login
  const adminLogin = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
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
