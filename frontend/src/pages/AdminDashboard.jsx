import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApplications } from "../services/api";
import jobs from "../data/jobs";

const ROLE_COLORS = [
  "bg-blue-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-sky-500",
];

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getApplications()
      .then((res) => setApplications(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = applications.length;
  const countFor = (title) =>
    applications.filter(
      (a) => a.appliedFor && a.appliedFor.toLowerCase() === title.toLowerCase()
    ).length;

  const countStatus = (status) =>
    applications.filter((a) => (a.status || "Pending") === status).length;

  const statusCards = [
    {
      label: "Total Applications",
      value: total,
      color: "bg-blue-600",
    },
    {
      label: "Pending Review",
      value: countStatus("Pending"),
      color: "bg-amber-500",
    },
    {
      label: "Selected Candidates",
      value: countStatus("Selected"),
      color: "bg-emerald-500",
    },
    {
      label: "Rejected Candidates",
      value: countStatus("Rejected"),
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">
            Overview of all submitted job applications and status metrics.
          </p>
        </div>
        <Link
          to="/admin/applications"
          className="inline-flex items-center text-sm font-semibold bg-brand-600 text-white px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors self-start sm:self-auto shadow-sm"
        >
          View All Applications &rarr;
        </Link>
      </div>

      {loading && <p className="text-slate-500">Loading dashboard...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="space-y-10">
          {/* Status Metrics */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Status Metrics
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

          {/* Role Metrics - Exact same style as the screenshot */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Role Metrics
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {jobs.map((job, idx) => {
                const count = countFor(job.title);
                const color = ROLE_COLORS[idx % ROLE_COLORS.length];

                return (
                  <div
                    key={job.slug}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{job.title}</p>
                      <p className="text-3xl font-extrabold text-slate-900">{count}</p>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full ${color}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
