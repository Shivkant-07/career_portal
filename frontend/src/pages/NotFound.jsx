import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto text-center px-5 py-28">
      <h1 className="text-6xl font-extrabold text-brand-600">404</h1>
      <p className="mt-4 text-lg text-slate-700">Page not found.</p>
      <Link
        to="/"
        className="inline-block mt-8 bg-brand-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
