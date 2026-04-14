import api from "./axios";

// ===================== PUBLIC =====================
export const getAllCategories = () =>
    api.get("/api/category");

export const getCategoryById = (id) =>
    api.get(`/api/category/${id}`);

// ===================== ADMIN =====================
export const createCategory = (category) =>
    api.post("/api/category", category); // ADMIN only

export const updateCategory = (id, category) =>
    api.put(`/api/category/${id}`, category);

export const deleteCategory = (id) =>
    api.delete(`/api/category/${id}`);
