import React from "react";
import jobs from "../data/jobs";
import JobCard from "../components/JobCard";

export default function Careers() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900">Open Positions</h1>
        <p className="mt-2 text-slate-600">
          Find a role that fits your skills and apply in just a few steps.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job.slug} job={job} />
        ))}
      </div>
    </div>
  );
}
