import { BACKEND_URL } from "./constants.js";

export const bring = async (url, options) => {
    try {
        const response = await fetch(BACKEND_URL + url, options);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};