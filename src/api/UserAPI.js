import api from "./axios";

// ADMIN ONLY

export const getAllUsers = () =>
    api.get("/api/user");

export const getUserByUsername = (username) =>
    api.get(`/api/user/${username}`);

export const disableUser = (id) =>
    api.put(`/api/user/${id}/disable`);

export const enableUser = (id) =>
    api.put(`/api/user/${id}/enable`);
