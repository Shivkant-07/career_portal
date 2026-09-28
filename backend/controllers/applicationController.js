const Application = require("../models/Application");

// Create new application
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

    // Check required fields
    if (!fullName || !email || !phone || !appliedFor) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Create application
    const newApplication = new Application({
      userId: req.user.userId,
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


// Get all applications - Admin
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({
      createdAt: -1,
    });

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


// Get single application by ID - Admin
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

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
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch application.",
    });
  }
};


// Get logged-in user's applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      userId: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your applications.",
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Selected",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status.",
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application status updated successfully.",
      data: application,
    });
  } catch (error) {
    console.error(error);

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
  getMyApplications,
  updateApplicationStatus,
};