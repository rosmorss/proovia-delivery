import { BACKEND_URL } from "./constants.js";

export const bring = async (url, options = {}) => {
    const response = await fetch(BACKEND_URL + url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
};

export const bringAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(BACKEND_URL + url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
};