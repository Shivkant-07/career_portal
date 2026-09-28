import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">

        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Career Portal. All rights reserved.
        </p>

        <div className="flex items-center gap-5 text-sm text-slate-500">
          <span className="hover:text-brand-600 cursor-pointer transition-colors">
            Careers
          </span>

          <span className="hover:text-brand-600 cursor-pointer transition-colors">
            Privacy Policy
          </span>

          <span className="hover:text-brand-600 cursor-pointer transition-colors">
            Contact
          </span>
        </div>

      </div>
    </footer>
  );
}
