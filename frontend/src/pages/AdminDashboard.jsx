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

  const summaryCards = [
    {
      label: "Total Applications",
      value: total,
      color: "bg-brand-600",
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
            Overview of all job roles from Careers page, applicant metrics, and status.
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
          {/* Status & Overview Metrics */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Application Overview
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {summaryCards.map((sc) => (
                <div
                  key={sc.label}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{sc.label}</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{sc.value}</p>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full ${sc.color}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Careers Job Roles Metrics */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Open Job Roles (Careers Page)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applications received for each active position listed on Careers.
                </p>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                {jobs.length} Positions
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map((job, idx) => {
                const count = countFor(job.title);
                const color = ROLE_COLORS[idx % ROLE_COLORS.length];

                return (
                  <div
                    key={job.slug}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
                          <h3 className="font-bold text-slate-900 text-base leading-snug">
                            {job.title}
                          </h3>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                            count > 0
                              ? "bg-brand-50 text-brand-700 border border-brand-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count} {count === 1 ? "applicant" : "applicants"}
                        </span>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <Link
                        to={`/careers/${job.slug}`}
                        className="text-slate-500 hover:text-brand-600 font-medium"
                      >
                        View Job &rarr;
                      </Link>
                      <Link
                        to="/admin/applications"
                        className="text-brand-600 hover:underline font-semibold"
                      >
                        Review Applications ({count})
                      </Link>
                    </div>
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
