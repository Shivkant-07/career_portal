import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApplications } from "../services/api";

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Reviewed: "bg-blue-100 text-blue-700",
  Selected: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getApplications()
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Applications</h1>
      <p className="text-sm text-slate-500 mb-8">
        All candidates who have applied through CareerConnect.
      </p>

      {loading && <p className="text-slate-500">Loading applications...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <p className="text-slate-500">No applications submitted yet.</p>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Applied For</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{app.fullName}</td>
                    <td className="px-5 py-3 text-slate-600">{app.email}</td>
                    <td className="px-5 py-3 text-slate-600">{app.appliedFor}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          STATUS_STYLES[app.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/admin/applications/${app._id}`}
                        className="text-brand-600 font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
