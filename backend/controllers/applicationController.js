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

// Active SSE connections for real-time updates
let sseClients = [];

// SSE stream endpoint handler
const streamApplicationEvents = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  const clientId = Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  const client = { id: clientId, res };
  sseClients.push(client);

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`);

  // Periodic heartbeat every 20 seconds to keep connection alive
  const keepAlive = setInterval(() => {
    try {
      res.write(`: keepalive\n\n`);
    } catch (e) {
      clearInterval(keepAlive);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(keepAlive);
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
};

// Broadcast status update to all connected clients in real-time
const broadcastStatusUpdate = (application) => {
  const payload = JSON.stringify({
    type: "STATUS_UPDATED",
    application,
  });

  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (err) {
      // Handled on close
    }
  });
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

    // Broadcast status change immediately to all connected candidates
    broadcastStatusUpdate(application);

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


// Update application by ID - Candidate (only owner)
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    // Verify ownership: candidate can only update their own application
    if (application.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this application.",
      });
    }

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
    } = req.body;

    // Check required fields
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and phone are required.",
      });
    }

    if (fullName) application.fullName = fullName.trim();
    if (email) application.email = email.trim();
    if (phone) application.phone = phone.trim();
    if (dateOfBirth !== undefined) application.dateOfBirth = dateOfBirth.trim();
    if (qualification !== undefined) application.qualification = qualification.trim();
    if (college !== undefined) application.college = college.trim();
    if (passingYear !== undefined) application.passingYear = passingYear.trim();
    if (percentage !== undefined) application.percentage = percentage.trim();
    if (skills !== undefined) application.skills = skills.trim();
    if (experience !== undefined) application.experience = experience ? experience.trim() : "";
    if (projects !== undefined) application.projects = projects ? projects.trim() : "";
    if (resumeLink !== undefined) application.resumeLink = resumeLink ? resumeLink.trim() : "";

    const savedApplication = await application.save();

    res.status(200).json({
      success: true,
      message: "Application updated successfully!",
      data: savedApplication,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update application.",
    });
  }
};


module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  getMyApplications,
  updateApplicationStatus,
  updateApplication,
  streamApplicationEvents,
};