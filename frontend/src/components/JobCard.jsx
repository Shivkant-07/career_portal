import React from "react";
import { useNavigate } from "react-router-dom";

export default function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{job.title}</h3>
        <ul className="flex flex-wrap gap-2 mb-6">
          {job.skills.map((skill) => (
            <li
              key={skill}
              className="text-xs font-medium bg-brand-50 text-brand-700 px-3 py-1 rounded-full"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => navigate(`/careers/${job.slug}`)}
        className="w-full bg-brand-600 text-white font-medium py-2.5 rounded-lg hover:bg-brand-700 transition-colors"
      >
        Apply Now
      </button>
    </div>
  );
}
