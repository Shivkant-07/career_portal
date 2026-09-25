const mongoose = require("mongoose");

// Schema for a single job application submitted by a candidate
const applicationSchema = new mongoose.Schema(
  {
    // Personal Details
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: String, required: true },

    // Education Details
    qualification: { type: String, required: true },
    college: { type: String, required: true },
    passingYear: { type: String, required: true },
    percentage: { type: String, required: true },

    // Skills / Experience
    skills: { type: String, required: true },
    experience: { type: String },
    projects: { type: String },
    resumeLink: { type: String },

    // Application meta
    appliedFor: { type: String, required: true },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Application", applicationSchema);
