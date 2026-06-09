const envBackendUrl = import.meta.env?.VITE_BACKEND_URL;

export const BACKEND_URL = (envBackendUrl || "http://localhost:3000").replace(/\/$/, "");
