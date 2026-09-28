import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getApplicationById, getApplications, updateApplicationStatus } from "../services/api";

const STATUS_CONFIG = {
  Pending: {
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    activeClass: "bg-amber-500 text-white border-amber-600 shadow-sm",
    defaultClass: "bg-white text-amber-700 border-amber-200 hover:bg-amber-50",
    desc: "Application under review",
  },
  Selected: {
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    activeClass: "bg-emerald-600 text-white border-emerald-700 shadow-sm",
    defaultClass: "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    desc: "Candidate shortlisted / hired",
  },
  Rejected: {
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
    activeClass: "bg-rose-600 text-white border-rose-700 shadow-sm",
    defaultClass: "bg-white text-rose-700 border-rose-200 hover:bg-rose-50",
    desc: "Candidate not shortlisted",
  },
};

const STATUS_OPTIONS = ["Pending", "Selected", "Rejected"];

export default function ApplicantDetails() {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);

  useEffect(() => {
    // Try fetching single application first, fallback to getApplications
    getApplicationById(id)
      .then((res) => {
        if (res.data) setApplicant(res.data);
        else setError("Applicant not found.");
      })
      .catch(() => {
        getApplications()
          .then((res) => {
            const found = res.data.find((a) => a._id === id);
            if (!found) setError("Applicant not found.");
            else setApplicant(found);
          })
          .catch((err) => setError(err.message));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!applicant || applicant.status === newStatus || updating) return;
    setUpdating(true);
    setStatusFeedback(null);
    try {
      const res = await updateApplicationStatus(applicant._id, newStatus);
      setApplicant((prev) => ({
        ...prev,
        status: newStatus,
        updatedAt: res.data?.updatedAt || new Date().toISOString(),
      }));
      setStatusFeedback({
        type: "success",
        text: `Status updated to "${newStatus}" successfully!`,
      });
      setTimeout(() => setStatusFeedback(null), 3500);
    } catch (err) {
      setStatusFeedback({
        type: "error",
        text: err.message || "Failed to update status. Please try again.",
      });
      setTimeout(() => setStatusFeedback(null), 4500);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="max-w-4xl mx-auto px-5 py-14 text-slate-500">Loading...</p>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-14">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/admin/applications" className="text-brand-600 font-medium hover:underline">
          &larr; Back to Applications
        </Link>
      </div>
    );
  }

  const currentStatus = applicant.status || "Pending";

  return (
    <div className="max-w-4xl mx-auto px-5 py-14">
      <Link to="/admin/applications" className="text-sm text-brand-600 font-medium hover:underline">
        &larr; Back to Applications
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {applicant.fullName}'s Application
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Applied for <span className="font-semibold text-slate-700">{applicant.appliedFor}</span>
          </p>
        </div>

        {/* Status Dropdown Quick Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Status:
          </span>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className={`text-xs font-bold px-3 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
              STATUS_CONFIG[currentStatus]?.badgeClass || "bg-slate-100 text-slate-700"
            }`}
          >
            <option value="Pending" className="bg-white text-slate-900 font-medium">Pending</option>
            <option value="Selected" className="bg-white text-slate-900 font-medium">Selected</option>
            <option value="Rejected" className="bg-white text-slate-900 font-medium">Rejected</option>
          </select>
          {updating && <span className="text-xs text-slate-400 animate-pulse">Saving...</span>}
        </div>
      </div>

      {/* Review Decision Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Review Application Decision</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Change the status to review and update candidate progress.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Current Status:
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                STATUS_CONFIG[currentStatus]?.badgeClass || "bg-slate-100 text-slate-700"
              }`}
            >
              {currentStatus}
            </span>
          </div>
        </div>

        {statusFeedback && (
          <div
            className={`mb-4 p-3 rounded-xl text-sm font-medium border flex items-center justify-between ${
              statusFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span>{statusFeedback.text}</span>
            <button
              onClick={() => setStatusFeedback(null)}
              className="text-xs opacity-75 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STATUS_OPTIONS.map((status) => {
            const config = STATUS_CONFIG[status];
            const isSelected = currentStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                disabled={updating}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected ? config.activeClass : config.defaultClass
                } ${updating ? "opacity-60 cursor-wait" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{status}</span>
                  {isSelected && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-semibold">
                      Current
                    </span>
                  )}
                </div>
                <p className={`text-xs ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                  {config.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <Section title="Personal Details">
          <Item label="Full Name" value={applicant.fullName} />
          <Item label="Email" value={applicant.email} />
          <Item label="Phone" value={applicant.phone} />
          <Item label="Date of Birth" value={applicant.dateOfBirth} />
        </Section>

        <Section title="Education">
          <Item label="Qualification" value={applicant.qualification} />
          <Item label="College" value={applicant.college} />
          <Item label="Passing Year" value={applicant.passingYear} />
          <Item label="Percentage / CGPA" value={applicant.percentage} />
        </Section>

        <Section title="Skills / Experience">
          <Item label="Skills" value={applicant.skills} />
          <Item label="Experience" value={applicant.experience || "—"} />
          <Item label="Projects" value={applicant.projects || "—"} />
          <Item
            label="Resume Link"
            value={
              applicant.resumeLink ? (
                <a
                  href={applicant.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 font-medium hover:underline break-all"
                >
                  {applicant.resumeLink}
                </a>
              ) : (
                "—"
              )
            }
          />
        </Section>

        <Section title="Application">
          <Item label="Applied For" value={applicant.appliedFor} />
          <Item
            label="Status"
            value={
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${
                  STATUS_CONFIG[currentStatus]?.badgeClass || "bg-slate-100 text-slate-700"
                }`}
              >
                {currentStatus}
              </span>
            }
          />
          <Item
            label="Application Date & Time"
            value={
              applicant.createdAt
                ? new Date(applicant.createdAt).toLocaleString()
                : "—"
            }
          />
          <Item
            label="Last Updated Date & Time"
            value={
              applicant.updatedAt || applicant.createdAt
                ? new Date(applicant.updatedAt || applicant.createdAt).toLocaleString()
                : "—"
            }
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <h2 className="text-base font-bold text-slate-900 mb-4">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">{children}</div>
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div>
      <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
      <div className="text-slate-800 font-medium break-words mt-0.5">{value}</div>
    </div>
  );
}
