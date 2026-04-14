import api from "./axios";

export const getRoles = () => api.get("/api/roles");

