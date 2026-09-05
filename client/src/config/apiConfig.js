// Centralized API base URL. In local dev, Vite doesn't have VITE_API_URL
// set, so it falls back to localhost. In production, set VITE_API_URL
// in your hosting provider's environment variables to your deployed
// backend's URL (e.g. https://your-app.onrender.com).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";