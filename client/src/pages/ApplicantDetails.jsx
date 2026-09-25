import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getApplications } from "../services/api";

export default function ApplicantDetails() {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getApplications()
      .then((res) => {
        const found = res.data.find((a) => a._id === id);
        if (!found) {
          setError("Applicant not found.");
        } else {
          setApplicant(found);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

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

  return (
    <div className="max-w-4xl mx-auto px-5 py-14">
      <Link to="/admin/applications" className="text-sm text-brand-600 font-medium hover:underline">
        &larr; Back to Applications
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-8">
        {applicant.fullName}'s Application
      </h1>

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
          <Item label="Resume Link" value={applicant.resumeLink || "—"} />
        </Section>

        <Section title="Application">
          <Item label="Applied For" value={applicant.appliedFor} />
          <Item label="Status" value={applicant.status} />
          <Item
            label="Application Date"
            value={new Date(applicant.createdAt).toLocaleString()}
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
      <p className="text-slate-800 font-medium break-words">{value}</p>
    </div>
  );
}
