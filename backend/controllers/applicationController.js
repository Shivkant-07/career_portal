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
      status: "Pending",
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

// @route   GET /api/applications/:id
// @desc    Get single application by ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application.",
    });
  }
};

// @route   PATCH /api/applications/:id/status
// @desc    Update application status (Pending, Selected, Rejected)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Selected", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status} successfully.`,
      data: application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application status.",
    });
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
};
