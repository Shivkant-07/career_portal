import React, { useState } from "react";
import jobs from "../data/jobs";
import JobCard from "../components/JobCard";

export default function Careers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      job.title.toLowerCase().includes(searchText) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchText)
      );

    const matchesFilter =
      filter === "All" ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(filter.toLowerCase())
      );

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Open Positions
        </h1>

        <p className="mt-2 text-slate-600">
          Find a role that fits your skills and apply in just a few steps.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by job title or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
        />

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="All">All Skills</option>
          <option value="React">React</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Node.js">Node.js</option>
          <option value="MongoDB">MongoDB</option>
          <option value="Java">Java</option>
          <option value="SQL">SQL</option>
          <option value="Testing">Testing</option>
          <option value="HTML">HTML</option>
          <option value="CSS">CSS</option>
        </select>
      </div>

      {/* Job Cards */}
      {filteredJobs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.slug} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500">
            No jobs found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}