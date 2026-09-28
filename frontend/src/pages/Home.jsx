import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Explore Jobs",
      desc: "Browse open roles across engineering, QA and more, all in one place.",
    },
    {
      title: "Apply Easily",
      desc: "A short, guided multi-step form takes you from details to submission in minutes.",
    },
    {
      title: "Track Applications",
      desc: "Every application is saved so our team can review it and follow up.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto text-center px-5 py-24">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Build Your Career With Us
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
            Discover exciting career opportunities and take the next step
            toward your future.
          </p>
          <button
            onClick={() => navigate("/careers")}
            className="mt-8 bg-brand-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Explore Careers
          </button>
        </div>
      </section>

      {/* Info section */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
