const express = require("express");
const router = express.Router();
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
} = require("../controllers/applicationController");

router.post("/", createApplication);
router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.patch("/:id/status", updateApplicationStatus);
router.put("/:id/status", updateApplicationStatus);
router.patch("/:id", updateApplicationStatus);

module.exports = router;
