import React, { useEffect, useState } from "react";
import { getApplications } from "../services/api";

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getApplications()
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = applications.length;
  const countFor = (title) =>
    applications.filter((a) => a.appliedFor === title).length;

  const countStatus = (status) =>
    applications.filter((a) => (a.status || "Pending") === status).length;

  const cards = [
    { label: "Total Applications", value: total, color: "bg-brand-600" },
    { label: "Frontend Developer", value: countFor("Frontend Developer"), color: "bg-emerald-600" },
    { label: "Software Tester", value: countFor("Software Tester"), color: "bg-amber-600" },
    { label: "Python Developer", value: countFor("Python Developer"), color: "bg-purple-600" },
  ];

  const statusCards = [
    {
      label: "Pending Applications",
      value: countStatus("Pending"),
      color: "bg-amber-500",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Selected Candidates",
      value: countStatus("Selected"),
      color: "bg-emerald-500",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Rejected Candidates",
      value: countStatus("Rejected"),
      color: "bg-rose-500",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin Dashboard</h1>
      <p className="text-sm text-slate-500 mb-8">
        Overview of all submitted job applications and status metrics.
      </p>

      {loading && <p className="text-slate-500">Loading dashboard...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Status Metrics
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {statusCards.map((sc) => (
                <div
                  key={sc.label}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{sc.label}</p>
                    <p className="text-3xl font-extrabold text-slate-900">{sc.value}</p>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full ${sc.color}`} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Role Metrics
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {cards.map((c) => (
                <div
                  key={c.label}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6"
                >
                  <div className={`w-10 h-10 rounded-lg ${c.color} mb-4`} />
                  <p className="text-3xl font-extrabold text-slate-900">{c.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
