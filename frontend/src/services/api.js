// Small fetch-based API helper. No third-party HTTP library is used.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// POST /api/applications -> submit a new application
export async function submitApplication(applicationData) {
  const response = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicationData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit application.");
  }

  return data;
}

// GET /api/applications -> fetch all applications
export async function getApplications() {
  const response = await fetch(`${API_URL}/applications`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch applications.");
  }

  return data;
}

// GET /api/applications/:id -> fetch a single application
export async function getApplicationById(id) {
  const response = await fetch(`${API_URL}/applications/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch application.");
  }

  return data;
}

// PATCH /api/applications/:id/status -> update status of an application
export async function updateApplicationStatus(id, status) {
  const response = await fetch(`${API_URL}/applications/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update application status.");
  }

  return data;
}

