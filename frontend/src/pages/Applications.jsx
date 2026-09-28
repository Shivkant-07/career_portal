import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApplications, updateApplicationStatus } from "../services/api";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-300",
  Selected: "bg-emerald-50 text-emerald-700 border-emerald-300",
  Rejected: "bg-rose-50 text-rose-700 border-rose-300",
};

const STATUS_DOT_STYLES = {
  Pending: "bg-amber-500",
  Selected: "bg-emerald-500",
  Rejected: "bg-rose-500",
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    getApplications()
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await updateApplicationStatus(appId, newStatus);

      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );

      setNotification({
        type: "success",
        text: `Application status updated to "${newStatus}"!`,
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: "error",
        text: err.message || "Failed to update application status.",
      });

      setTimeout(() => setNotification(null), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications =
    filter === "All"
      ? applications
      : applications.filter(
          (app) => (app.status || "Pending") === filter
        );

  const counts = {
    All: applications.length,
    Pending: applications.filter(
      (a) => (a.status || "Pending") === "Pending"
    ).length,
    Selected: applications.filter((a) => a.status === "Selected").length,
    Rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Applications
          </h1>

          <p className="text-sm text-slate-500">
            Review and update status for all submitted applications.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {["All", "Pending", "Selected", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab} ({counts[tab] || 0})
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{notification.text}</span>

          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {loading && (
        <p className="text-slate-500">Loading applications...</p>
      )}

      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <p className="text-slate-500">No applications submitted yet.</p>
      )}

      {!loading &&
        !error &&
        applications.length > 0 &&
        filteredApplications.length === 0 && (
          <p className="text-slate-500">
            No applications with status "{filter}".
          </p>
        )}

      {!loading && !error && filteredApplications.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Applied For</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date & Time</th>
                  <th className="px-5 py-3 font-medium">Review</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => {
                  const currentStatus = app.status || "Pending";
                  const isUpdating = updatingId === app._id;

                  return (
                    <tr
                      key={app._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {app.fullName}
                      </td>

                      <td className="px-5 py-3 text-slate-600">
                        {app.email}
                      </td>

                      <td className="px-5 py-3 text-slate-600">
                        {app.appliedFor}
                      </td>

                      <td className="px-5 py-3">
                        <div className="inline-flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              STATUS_DOT_STYLES[currentStatus] ||
                              "bg-slate-400"
                            }`}
                          />

                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              handleStatusChange(
                                app._id,
                                e.target.value
                              )
                            }
                            disabled={isUpdating}
                            title="Click to change application status"
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                              STATUS_STYLES[currentStatus] ||
                              "bg-slate-100 text-slate-700 border-slate-200"
                            } ${
                              isUpdating
                                ? "opacity-50 cursor-wait"
                                : ""
                            }`}
                          >
                            <option
                              value="Pending"
                              className="bg-white text-slate-900 font-medium"
                            >
                              Pending
                            </option>

                            <option
                              value="Selected"
                              className="bg-white text-slate-900 font-medium"
                            >
                              Selected
                            </option>

                            <option
                              value="Rejected"
                              className="bg-white text-slate-900 font-medium"
                            >
                              Rejected
                            </option>
                          </select>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-slate-500">
                        {new Date(app.createdAt).toLocaleString()}
                      </td>

                      <td className="px-5 py-3">
                        <Link
                          to={`/admin/applications/${app._id}`}
                          className="inline-flex items-center text-brand-600 font-semibold hover:underline"
                        >
                          Review &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
