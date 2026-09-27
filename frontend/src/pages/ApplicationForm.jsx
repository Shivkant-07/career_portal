import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import jobs from "../data/jobs";
import { submitApplication } from "../services/api";

const STEP_LABELS = ["Personal Details", "Education", "Skills / Experience", "Review"];

const initialData = {
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

export default function ApplicationForm() {
  const { jobSlug } = useParams();
  const navigate = useNavigate();

  const job = jobs.find((j) => j.slug === jobSlug);
  const appliedFor = job ? job.title : "General Application";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validates only the fields relevant to the current step
  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Enter a valid email address.";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required.";
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Enter a valid 10-digit phone number.";
      }
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
    }

    if (step === 2) {
      if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required.";
      if (!formData.college.trim()) newErrors.college = "College / University is required.";
      if (!formData.passingYear.trim()) newErrors.passingYear = "Passing year is required.";
      if (!formData.percentage.trim()) newErrors.percentage = "Percentage / CGPA is required.";
    }

    if (step === 3) {
      if (!formData.skills.trim()) newErrors.skills = "Please list at least one skill.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    if (submitting || submitted) return; // guard against double submission
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitApplication({ ...formData, appliedFor });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 grid place-items-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Application Submitted Successfully!
        </h1>
        <p className="text-slate-600 mb-8">
          Thank you for applying. Your application has been submitted successfully.
        </p>
        <Link
          to="/careers"
          className="inline-block bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors"
        >
          Back to Careers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Apply for {appliedFor}</h1>
      <p className="text-sm text-slate-500 mb-8">
        Step {step} of 4 &middot; {STEP_LABELS[step - 1]}
      </p>

      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {STEP_LABELS.map((label, index) => {
          const current = index + 1;
          const active = current <= step;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full grid place-items-center text-sm font-semibold ${
                    active ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {current}
                </div>
                <span className="text-xs text-slate-500 mt-2 text-center hidden sm:block">
                  {label}
                </span>
              </div>
              {index < STEP_LABELS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 -mt-6 ${
                    current < step ? "bg-brand-600" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        {step === 1 && (
          <div className="space-y-4">
            <Field label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} />
            <Field label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
            <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="10-digit number" />
            <Field label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Field label="Qualification" name="qualification" value={formData.qualification} onChange={handleChange} error={errors.qualification} placeholder="e.g. B.Tech" />
            <Field label="College / University" name="college" value={formData.college} onChange={handleChange} error={errors.college} />
            <Field label="Passing Year" name="passingYear" value={formData.passingYear} onChange={handleChange} error={errors.passingYear} placeholder="e.g. 2026" />
            <Field label="Percentage / CGPA" name="percentage" value={formData.percentage} onChange={handleChange} error={errors.percentage} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Field label="Skills" name="skills" value={formData.skills} onChange={handleChange} error={errors.skills} placeholder="e.g. React, JavaScript" />
            <Field label="Experience" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. Fresher / 2 years" />
            <Field label="Projects" name="projects" value={formData.projects} onChange={handleChange} />
            <Field label="Resume Link" name="resumeLink" value={formData.resumeLink} onChange={handleChange} placeholder="https://drive.google.com/..." />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Application Review</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <ReviewItem label="Name" value={formData.fullName} />
              <ReviewItem label="Email" value={formData.email} />
              <ReviewItem label="Phone" value={formData.phone} />
              <ReviewItem label="Date of Birth" value={formData.dateOfBirth} />
              <ReviewItem label="Qualification" value={formData.qualification} />
              <ReviewItem label="College" value={formData.college} />
              <ReviewItem label="Passing Year" value={formData.passingYear} />
              <ReviewItem label="Percentage / CGPA" value={formData.percentage} />
              <ReviewItem label="Skills" value={formData.skills} />
              <ReviewItem label="Experience" value={formData.experience || "—"} />
              <ReviewItem label="Projects" value={formData.projects || "—"} />
              <ReviewItem label="Resume Link" value={formData.resumeLink || "—"} />
              <ReviewItem label="Applied For" value={appliedFor} />
            </div>
            {submitError && (
              <p className="text-sm text-red-600 mt-4">{submitError}</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {step < 4 && (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
            >
              Next
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, error, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 ${
          error ? "border-red-400 focus:ring-red-300" : "border-slate-300 focus:ring-brand-500"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div>
      <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-slate-800 font-medium break-words">{value}</p>
    </div>
  );
}
