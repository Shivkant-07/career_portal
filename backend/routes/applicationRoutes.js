const express = require("express");

const {
  createApplication,
  getApplications,
  getApplicationById,
  getMyApplications,
  updateApplicationStatus,
  updateApplication,
  streamApplicationEvents,
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Real-time SSE stream for instant status updates
router.get("/stream", streamApplicationEvents);

// Candidate - Submit application
router.post("/", protect, createApplication);

// Admin - Get all applications
router.get("/", getApplications);

// Candidate - Get own applications
router.get("/my", protect, getMyApplications);

// Admin - Get single application
router.get("/:id", getApplicationById);

// Admin - Update application status (supports both PUT and PATCH)
router.put("/:id/status", updateApplicationStatus);
router.patch("/:id/status", updateApplicationStatus);

// Candidate - Update application
router.put("/:id", protect, updateApplication);
router.patch("/:id", protect, updateApplication);

module.exports = router;
