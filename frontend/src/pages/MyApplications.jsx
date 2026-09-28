import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyApplications } from "../services/api";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyApplications()
      .then((res) => {
        setApplications(res.data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          My Applications
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Track the status of jobs you have applied for.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-slate-500">
          Loading your applications...
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          {error}
        </div>
      )}

      {/* No Applications */}
      {!loading && !error && applications.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <h2 className="text-lg font-semibold text-slate-800">
            No Applications Yet
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            You haven't applied for any jobs yet.
          </p>

          <Link
            to="/careers"
            className="inline-block mt-5 bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      )}

      {/* Applications */}
      {!loading && !error && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((application) => {
            const status = application.status || "Pending";

            return (
              <div
                key={application._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {application.appliedFor}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Applied on{" "}
                      {new Date(
                        application.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`inline-flex self-start sm:self-auto px-3 py-1.5 rounded-full border text-xs font-semibold ${
                      STATUS_STYLES[status] ||
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">
                      Applicant
                    </span>
                    <p className="font-medium text-slate-700">
                      {application.fullName}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">
                      Email
                    </span>
                    <p className="font-medium text-slate-700">
                      {application.email}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}