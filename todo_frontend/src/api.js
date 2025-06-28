//
// Utility functions for interacting with the backend API for authentication and task management.
//
// All requests are made to the BACKEND_URL specified below.
// You may want to relocate the BACKEND_URL to an .env file for a real deployment.
//
const BACKEND_URL = "https://vscode-internal-115-beta.beta01.cloud.kavia.ai:3001";

let token = null;

/**
 * Sets the JWT token for authenticated requests.
 * @param {string} newToken 
 */
export function setToken(newToken) {
  token = newToken;
}

/**
 * Clears the JWT token (on logout).
 */
export function clearToken() {
  token = null;
}

/**
 * INTERNAL: Helper to generate headers.
 */
function getHeaders(isJson = true) {
  const headers = {};
  if (isJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// PUBLIC_INTERFACE
/**
 * Registers a new user.
 * @param {string} username 
 * @param {string} password 
 */
export async function register(username, password) {
  const resp = await fetch(`${BACKEND_URL}/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

// PUBLIC_INTERFACE
/**
 * Logs in a user, and returns and saves the JWT token.
 * @param {string} username
 * @param {string} password
 */
export async function login(username, password) {
  const resp = await fetch(`${BACKEND_URL}/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  setToken(data.access_token);
  return data;
}

// PUBLIC_INTERFACE
/**
 * Gets the current user's info.
 */
export async function getProfile() {
  const resp = await fetch(`${BACKEND_URL}/profile`, {
    headers: getHeaders(),
  });
  if (!resp.ok) throw new Error("Authentication required.");
  return resp.json();
}

// PUBLIC_INTERFACE
/**
 * Fetch all tasks.
 */
export async function getTasks() {
  const resp = await fetch(`${BACKEND_URL}/tasks`, {
    headers: getHeaders(),
  });
  if (!resp.ok) throw new Error("Unable to fetch tasks.");
  return resp.json();
}

// PUBLIC_INTERFACE
/**
 * Create a new task.
 * @param {object} task Task to create: { title, description }
 */
export async function createTask(task) {
  const resp = await fetch(`${BACKEND_URL}/tasks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });
  if (!resp.ok) throw new Error("Unable to create task.");
  return resp.json();
}

// PUBLIC_INTERFACE
/**
 * Update a task.
 * @param {number} id The task ID.
 * @param {object} updates The update fields.
 */
export async function updateTask(id, updates) {
  const resp = await fetch(`${BACKEND_URL}/tasks/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!resp.ok) throw new Error("Failed to update task.");
  return resp.json();
}

// PUBLIC_INTERFACE
/**
 * Delete a task.
 * @param {number} id The task ID.
 */
export async function deleteTask(id) {
  const resp = await fetch(`${BACKEND_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!resp.ok) throw new Error("Failed to delete task.");
  return resp.json();
}
