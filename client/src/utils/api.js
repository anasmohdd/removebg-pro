/**
 * utils/api.js
 * Configured axios instance that automatically attaches the JWT token
 * and handles 401 responses by clearing auth state.
 */

import axios from "axios";

const BASE_URL = "https://removebg-pro-2o3u.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json"
  }
});

// ─── Request interceptor: attach JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("rbg_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle auth errors ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local storage
      localStorage.removeItem("rbg_token");
      localStorage.removeItem("rbg_user");
      // Redirect to login (without React Router dependency here)
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
