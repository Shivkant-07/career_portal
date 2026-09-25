import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} CareerConnect. All rights reserved.
        </p>
        <p className="text-sm text-slate-400">Built with React, Node.js & MongoDB</p>
      </div>
    </footer>
  );
}
