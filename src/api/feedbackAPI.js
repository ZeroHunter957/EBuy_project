import api from "./axios";

export const getAllFeedback = () =>
    api.get("/api/feedback");

export const getFeedbackByUser = (userId) =>
    api.get(`/api/feedback/user/${userId}`);

export const getUnreadFeedbackCount = () =>
    api.get("/api/feedback/unread/count");

export const markFeedbackProcessed = (id) =>
    api.put(`/api/feedback/${id}/processed`);

// ===================== USER =====================
export const addFeedback = (feedback) =>
    api.post("/api/feedback", feedback);
