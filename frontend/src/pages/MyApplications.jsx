import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyApplications, updateApplication, API_URL } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_DOTS = {
  Pending: "bg-amber-500",
  Selected: "bg-emerald-500",
  Rejected: "bg-rose-500",
};

const STATUS_DESCRIPTIONS = {
  Pending: "Your application is currently under review by our hiring team.",
  Selected: "Congratulations! Your application has been shortlisted.",
  Rejected: "Thank you for applying. Currently, this application is not shortlisted.",
};

const emptyFormData = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  qualification: "",
  college: "",
  passingYear: "",
  percentage: "",
  skills: "",
  experience: "",
  projects: "",
  resumeLink: "",
};

export default function MyApplications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review & Edit state
  const [reviewApp, setReviewApp] = useState(null);
  const [editApp, setEditApp] = useState(null);
  const [editFormData, setEditFormData] = useState(emptyFormData);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Update status immediately across list, review modal, and edit modal
  const applyStatusUpdate = useCallback(
    (appId, newStatus, updatedAt) => {
      setApplications((prev) => {
        let changed = false;
        let jobTitle = "";
        const updatedList = prev.map((app) => {
          if (app._id === appId) {
            if (app.status !== newStatus) {
              changed = true;
              jobTitle = app.appliedFor;
            }
            return {
              ...app,
              status: newStatus,
              updatedAt: updatedAt || new Date().toISOString(),
            };
          }
          return app;
        });

        if (changed) {
          showToast(
            `Status for "${jobTitle || "your application"}" updated to "${newStatus}"!`,
            newStatus === "Selected" ? "success" : "info"
          );
        }

        return updatedList;
      });

      // Update Review Modal if open for this application
      setReviewApp((prev) => {
        if (prev && prev._id === appId) {
          return {
            ...prev,
            status: newStatus,
            updatedAt: updatedAt || new Date().toISOString(),
          };
        }
        return prev;
      });

      // Update Edit Modal if open
      setEditApp((prev) => {
        if (prev && prev._id === appId) {
          return {
            ...prev,
            status: newStatus,
          };
        }
        return prev;
      });
    },
    [showToast]
  );

  // Initial fetch with spinner
  const fetchApplications = useCallback(() => {
    setLoading(true);
    getMyApplications()
      .then((res) => {
        setApplications(res.data || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load applications.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Silent refetch (no spinner)
  const fetchApplicationsSilently = useCallback(() => {
    getMyApplications()
      .then((res) => {
        if (res.data) {
          setApplications((prev) => {
            // Check if status changed for any item
            res.data.forEach((fresh) => {
              const old = prev.find((p) => p._id === fresh._id);
              if (old && old.status !== fresh.status) {
                showToast(
                  `Status for "${fresh.appliedFor}" updated to "${fresh.status}"!`,
                  fresh.status === "Selected" ? "success" : "info"
                );
              }
            });

            // Sync open Review modal
            setReviewApp((curr) => {
              if (!curr) return null;
              const matching = res.data.find((f) => f._id === curr._id);
              return matching || curr;
            });

            return res.data;
          });
        }
      })
      .catch(() => {});
  }, [showToast]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchApplications();

    // 1. Real-Time SSE Listener (Updates instantly when admin changes status)
    let eventSource = null;
    try {
      eventSource = new EventSource(`${API_URL}/applications/stream`);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "STATUS_UPDATED" && payload.application) {
            const app = payload.application;
            applyStatusUpdate(app._id, app.status, app.updatedAt);
          }
        } catch (e) {
          // heartbeat or unparseable
        }
      };
      eventSource.onerror = () => {
        // SSE disconnected, will rely on polling fallback
      };
    } catch (err) {
      // EventSource not supported
    }

    // Background silent polling (every 3 seconds)
    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        fetchApplicationsSilently();
      }
    }, 3000);

    // Window focus & Tab visibility refetch
    const handleFocus = () => {
      fetchApplicationsSilently();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [user, fetchApplications, fetchApplicationsSilently, applyStatusUpdate]);

  // Open review modal
  const handleOpenReview = (application) => {
    setReviewApp(application);
  };

  // Open edit modal
  const handleOpenEdit = (application) => {
    setEditApp(application);
    setEditFormData({
      fullName: application.fullName || "",
      email: application.email || "",
      phone: application.phone || "",
      dateOfBirth: application.dateOfBirth || "",
      qualification: application.qualification || "",
      college: application.college || "",
      passingYear: application.passingYear || "",
      percentage: application.percentage || "",
      skills: application.skills || "",
      experience: application.experience || "",
      projects: application.projects || "",
      resumeLink: application.resumeLink || "",
    });
    setFormErrors({});
    setSaveError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEditForm = () => {
    const errs = {};
    if (!editFormData.fullName.trim()) errs.fullName = "Full name is required.";

    if (!editFormData.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(editFormData.email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    if (!editFormData.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(editFormData.phone.trim())) {
      errs.phone = "Enter a valid 10-digit phone number.";
    }

    if (!editFormData.dateOfBirth) {
      errs.dateOfBirth = "Date of birth is required.";
    }

    if (!editFormData.qualification.trim()) {
      errs.qualification = "Qualification is required.";
    }

    if (!editFormData.college.trim()) {
      errs.college = "College / University is required.";
    }

    if (!editFormData.passingYear.trim()) {
      errs.passingYear = "Passing year is required.";
    }

    if (!editFormData.percentage.trim()) {
      errs.percentage = "Percentage / CGPA is required.";
    }

    if (!editFormData.skills.trim()) {
      errs.skills = "Please list at least one skill.";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setSaving(true);
    setSaveError("");

    try {
      const response = await updateApplication(editApp._id, editFormData);
      const updatedApp = response.data;

      // Update in applications list
      setApplications((prev) =>
        prev.map((app) => (app._id === updatedApp._id ? updatedApp : app))
      );

      // If review modal is viewing this application, update review modal too
      if (reviewApp && reviewApp._id === updatedApp._id) {
        setReviewApp(updatedApp);
      }

      setEditApp(null);
      showToast("Application updated successfully!");
    } catch (err) {
      setSaveError(err.message || "Failed to update application. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-3 transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700"
              : toast.type === "info"
              ? "bg-brand-600 text-white border-brand-700"
              : "bg-rose-600 text-white border-rose-700"
          }`}
        >
          <span className="font-bold text-lg">
            {toast.type === "success" ? "✓" : "ℹ"}
          </span>
          <p className="text-sm font-medium">{toast.text}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 opacity-80 hover:opacity-100 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, edit, and track the real-time status of jobs you have applied for.
          </p>
        </div>

        {applications.length > 0 && (
          <Link
            to="/careers"
            className="self-start sm:self-auto inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          >
            More Jobs
          </Link>
        )}
      </div>

      {/* Unauthenticated User Warning */}
      {!user && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-2xl mb-4">
            🔒
          </div>
          <h2 className="text-lg font-bold text-slate-800">Please Log In</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            You need to be logged in to view, review, and edit your submitted applications.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Loading state */}
      {user && loading && (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Loading your applications...</p>
        </div>
      )}

      {/* Error state */}
      {user && error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between">
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={fetchApplications}
            className="text-xs bg-rose-100 text-rose-800 px-3 py-1.5 rounded-lg font-semibold hover:bg-rose-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {user && !loading && !error && applications.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 grid place-items-center mx-auto mb-4 text-3xl">
            📋
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            No Applications Yet
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            You haven't submitted any job applications yet. Discover open roles and apply in just a few minutes.
          </p>
          <Link
            to="/careers"
            className="inline-block mt-6 bg-brand-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          >
            Browse Jobs
          </Link>
        </div>
      )}

      {/* Applications List */}
      {user && !loading && !error && applications.length > 0 && (
        <div className="space-y-5">
          {applications.map((application) => {
            const status = application.status || "Pending";

            return (
              <div
                key={application._id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {application.appliedFor}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Applied on {new Date(application.createdAt).toLocaleString()}
                      {application.updatedAt && application.updatedAt !== application.createdAt && (
                        <span className="ml-2 text-slate-400">
                          &middot; Updated on {new Date(application.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 ${
                        STATUS_STYLES[status] ||
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          STATUS_DOTS[status] || "bg-slate-400"
                        }`}
                      />
                      {status}
                    </span>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                      Applicant Name
                    </span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {application.fullName}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                      Email
                    </span>
                    <p className="font-medium text-slate-800 mt-0.5 truncate">
                      {application.email}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                      Phone
                    </span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {application.phone}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                      Education
                    </span>
                    <p className="font-medium text-slate-800 mt-0.5 truncate">
                      {application.qualification} &bull; {application.college}
                    </p>
                  </div>
                </div>

                {/* Actions row */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    {STATUS_DESCRIPTIONS[status] || "Status updated"}
                  </p>

                  <div className="flex items-center gap-2">
                    {/* Review Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenReview(application)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <svg
                        className="w-4 h-4 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Review
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(application)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Application
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= REVIEW MODAL ================= */}
      {reviewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Application Review
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold transition-all duration-300 ${
                      STATUS_STYLES[reviewApp.status || "Pending"]
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        STATUS_DOTS[reviewApp.status || "Pending"]
                      }`}
                    />
                    {reviewApp.status || "Pending"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applied for:{" "}
                  <span className="font-semibold text-slate-700">
                    {reviewApp.appliedFor}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReviewApp(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 grid place-items-center transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Personal Details */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <span>👤</span> Personal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ReviewItem label="Full Name" value={reviewApp.fullName} />
                  <ReviewItem label="Email" value={reviewApp.email} />
                  <ReviewItem label="Phone" value={reviewApp.phone} />
                  <ReviewItem label="Date of Birth" value={reviewApp.dateOfBirth} />
                </div>
              </div>

              {/* Education Details */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <span>🎓</span> Education Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ReviewItem label="Qualification" value={reviewApp.qualification} />
                  <ReviewItem label="College / University" value={reviewApp.college} />
                  <ReviewItem label="Passing Year" value={reviewApp.passingYear} />
                  <ReviewItem label="Percentage / CGPA" value={reviewApp.percentage} />
                </div>
              </div>

              {/* Skills & Experience */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <span>💼</span> Skills & Experience
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {reviewApp.skills
                        ? reviewApp.skills.split(",").map((s, idx) => (
                            <span
                              key={idx}
                              className="bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-0.5 rounded-md text-xs font-medium"
                            >
                              {s.trim()}
                            </span>
                          ))
                        : "—"}
                    </div>
                  </div>

                  <ReviewItem
                    label="Experience"
                    value={reviewApp.experience || "Fresher / None specified"}
                  />

                  <ReviewItem
                    label="Projects"
                    value={reviewApp.projects || "None listed"}
                  />

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Resume Link
                    </p>
                    {reviewApp.resumeLink ? (
                      <a
                        href={reviewApp.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-600 font-semibold hover:underline mt-1 break-all"
                      >
                        {reviewApp.resumeLink}
                        <span className="text-xs">↗</span>
                      </a>
                    ) : (
                      <p className="text-slate-500 mt-1">No resume link provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-slate-400 flex flex-wrap justify-between gap-2 px-1">
                <span>
                  Submitted: {new Date(reviewApp.createdAt).toLocaleString()}
                </span>
                {reviewApp.updatedAt && (
                  <span>
                    Last updated: {new Date(reviewApp.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                type="button"
                onClick={() => setReviewApp(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = reviewApp;
                  setReviewApp(null);
                  handleOpenEdit(target);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Edit Application
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update details for{" "}
                  <span className="font-semibold text-slate-700">
                    {editApp.appliedFor}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditApp(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 grid place-items-center transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {saveError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                    {saveError}
                  </div>
                )}

                {editApp.status && editApp.status !== "Pending" && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    <strong>Note:</strong> Your application status is currently{" "}
                    <strong>{editApp.status}</strong>. Updating your profile information
                    will keep your status intact.
                  </div>
                )}

                {/* Section 1: Personal Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <span>👤</span> Personal Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Full Name *"
                      name="fullName"
                      value={editFormData.fullName}
                      onChange={handleEditChange}
                      error={formErrors.fullName}
                    />

                    <FormField
                      label="Email Address *"
                      name="email"
                      type="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      error={formErrors.email}
                    />

                    <FormField
                      label="Phone Number *"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditChange}
                      error={formErrors.phone}
                      placeholder="10-digit phone number"
                    />

                    <FormField
                      label="Date of Birth *"
                      name="dateOfBirth"
                      type="date"
                      value={editFormData.dateOfBirth}
                      onChange={handleEditChange}
                      error={formErrors.dateOfBirth}
                    />
                  </div>
                </div>

                {/* Section 2: Education Details */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <span>🎓</span> Education Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Qualification *"
                      name="qualification"
                      value={editFormData.qualification}
                      onChange={handleEditChange}
                      error={formErrors.qualification}
                      placeholder="e.g. B.Tech Computer Science"
                    />

                    <FormField
                      label="College / University *"
                      name="college"
                      value={editFormData.college}
                      onChange={handleEditChange}
                      error={formErrors.college}
                      placeholder="College or University name"
                    />

                    <FormField
                      label="Passing Year *"
                      name="passingYear"
                      value={editFormData.passingYear}
                      onChange={handleEditChange}
                      error={formErrors.passingYear}
                      placeholder="e.g. 2025"
                    />

                    <FormField
                      label="Percentage / CGPA *"
                      name="percentage"
                      value={editFormData.percentage}
                      onChange={handleEditChange}
                      error={formErrors.percentage}
                      placeholder="e.g. 8.5 CGPA or 85%"
                    />
                  </div>
                </div>

                {/* Section 3: Skills & Experience */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <span>💼</span> Skills & Experience
                  </h4>

                  <FormField
                    label="Key Skills * (comma-separated)"
                    name="skills"
                    value={editFormData.skills}
                    onChange={handleEditChange}
                    error={formErrors.skills}
                    placeholder="e.g. React, Node.js, JavaScript, Tailwind CSS"
                  />

                  <FormField
                    label="Experience"
                    name="experience"
                    value={editFormData.experience}
                    onChange={handleEditChange}
                    placeholder="e.g. Fresher or 1.5 Years in Web Dev"
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Projects / Portfolio
                    </label>
                    <textarea
                      name="projects"
                      rows="3"
                      value={editFormData.projects}
                      onChange={handleEditChange}
                      placeholder="Mention your major projects or achievements..."
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <FormField
                    label="Resume Link (Google Drive / Dropbox / Portfolio)"
                    name="resumeLink"
                    value={editFormData.resumeLink}
                    onChange={handleEditChange}
                    placeholder="https://drive.google.com/file/..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setEditApp(null)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-slate-800 font-semibold mt-0.5 break-words">
        {value || "—"}
      </p>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-300"
            : "border-slate-300 focus:ring-brand-500 focus:border-brand-500"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}