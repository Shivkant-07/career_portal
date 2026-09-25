import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClasses =
    "text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">
            C
          </span>
          <span className="text-lg font-bold text-slate-900">CareerConnect</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className={linkClasses}>Home</Link>

          {!isAdmin && (
            <>
              <Link to="/careers" className={linkClasses}>Careers</Link>
              <Link to="/login" className={linkClasses}>Login</Link>
              
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/admin/dashboard" className={linkClasses}>Dashboard</Link>
              <Link to="/admin/applications" className={linkClasses}>Applications</Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
