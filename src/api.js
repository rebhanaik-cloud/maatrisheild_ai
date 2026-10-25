/**
 * MaatriShield AI - Centralized API & Session Client
 */

export const TOKEN_KEY = "maatrishield-token";
export const PROFILE_KEY = "maatrishield-profile";
const LEGACY_PROFILE_KEY = "maat rishield-profile";

/**
 * Resolve API base URL dynamically based on environment.
 * Uses VITE_API_URL if configured, otherwise falls back to localhost in development
 * or the live Render backend in production.
 */
export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8000";
    }
  }
  return "https://maatrisheild-ai.onrender.com";
};

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error("Failed to store token in localStorage:", err);
  }
}

/**
 * Retrieve profile with safe backward-compatibility migration for legacy typo key.
 */
export function getStoredProfile() {
  try {
    // Migrate legacy key if present
    const legacy = localStorage.getItem(LEGACY_PROFILE_KEY);
    if (legacy) {
      try {
        localStorage.setItem(PROFILE_KEY, legacy);
      } catch {
        // ignore
      }
      localStorage.removeItem(LEGACY_PROFILE_KEY);
    }

    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setStoredProfile(profile) {
  try {
    if (profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
    localStorage.removeItem(LEGACY_PROFILE_KEY);
  } catch (err) {
    console.error("Failed to store profile in localStorage:", err);
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(LEGACY_PROFILE_KEY);
  } catch (err) {
    console.error("Failed to clear auth session:", err);
  }
}

/**
 * Core authenticated fetch client with JSON serialization and error mapping.
 */
export async function request(path, options = {}) {
  const baseUrl = getApiUrl();
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error(
      "Unable to connect to the MaatriShield server. Please ensure the backend is running and reachable."
    );
  }

  // Handle unauthorized/expired token
  if (res.status === 401 && token && path !== "/api/auth/login") {
    clearAuthSession();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("maatrishield:unauthorized"));
    }
  }

  if (res.status === 204) {
    return null;
  }

  let data = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    const text = await res.text();
    data = text ? { message: text } : null;
  }

  if (!res.ok) {
    let message = "Request failed. Please try again.";
    if (data) {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail.map((d) => d.msg || d.message).join(", ");
      } else if (data.message) {
        message = data.message;
      }
    }
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authAPI = {
  register: (email, password) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request("/api/me"),
};

export const profileAPI = {
  get: () => request("/api/profile"),
  save: (profileData) =>
    request("/api/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};

export const appointmentsAPI = {
  list: () => request("/api/appointments"),
  create: (appointmentData) =>
    request("/api/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    }),
  delete: (id) =>
    request(`/api/appointments/${id}`, {
      method: "DELETE",
    }),
};

export const notesAPI = {
  list: () => request("/api/notes"),
  create: (noteData) =>
    request("/api/notes", {
      method: "POST",
      body: JSON.stringify(noteData),
    }),
  delete: (id) =>
    request(`/api/notes/${id}`, {
      method: "DELETE",
    }),
};

export const assistantAPI = {
  ask: (content, category = "general") =>
    request("/api/assistant", {
      method: "POST",
      body: JSON.stringify({ content, category }),
    }),
};

export const healthAPI = {
  check: () => request("/api/health"),
};
