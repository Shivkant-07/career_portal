const express = require("express");

const {
  createApplication,
  getApplications,
  getApplicationById,
  getMyApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

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

module.exports = router;
