export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9999";

export const toAbsoluteApiUrl = (path = "") => {
    if (!path) return API_BASE_URL;
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalized}`;
};
