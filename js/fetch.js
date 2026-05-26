import { BACKEND_URL } from "./constants.js";

const defaultOptions = {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
};

export const bring = async (url, options) => {
    try {
        const response = await fetch(BACKEND_URL + url, { ...defaultOptions, ...options });
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};