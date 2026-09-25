const Application = require("../models/Application");

// @route   POST /api/applications
// @desc    Save a new job application to MongoDB
const createApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      qualification,
      college,
      passingYear,
      percentage,
      skills,
      experience,
      projects,
      resumeLink,
      appliedFor,
    } = req.body;

    if (!fullName || !email || !phone || !appliedFor) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const newApplication = new Application({
      fullName,
      email,
      phone,
      dateOfBirth,
      qualification,
      college,
      passingYear,
      percentage,
      skills,
      experience,
      projects,
      resumeLink,
      appliedFor,
    });

    const savedApplication = await newApplication.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: savedApplication,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// @route   GET /api/applications
// @desc    Get all applications, newest first
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications.",
    });
  }
};

module.exports = { createApplication, getApplications };
