const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Register user
export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed.");
  }

  return data;
}


// Login user
export async function loginUser(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed.");
  }

  return data;
}


// Submit job application
export async function submitApplication(applicationData) {
  const token = localStorage.getItem("cc_user_token");

  const response = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(applicationData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to submit application."
    );
  }

  return data;
}


// Get all applications - Admin
export async function getApplications() {
  const response = await fetch(`${API_URL}/applications`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch applications."
    );
  }

  return data;
}


// Get single application by ID - Admin
export async function getApplicationById(appId) {
  const response = await fetch(
    `${API_URL}/applications/${appId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch application."
    );
  }

  return data;
}


// Get logged-in user's applications
export async function getMyApplications() {
  const token = localStorage.getItem("cc_user_token");

  const response = await fetch(`${API_URL}/applications/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch your applications."
    );
  }

  return data;
}


// Update application status - Admin
export async function updateApplicationStatus(appId, status) {
  const response = await fetch(
    `${API_URL}/applications/${appId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update application status."
    );
  }

  return data;
}