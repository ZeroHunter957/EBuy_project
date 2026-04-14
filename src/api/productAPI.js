import api from "./axios";

// Public
export const getAllProducts = (page = 0, size = 10) =>
    api.get(`/api/product/admin/all?page=${page}&size=${size}`);

export const getNewProducts = (page = 0, size = 10) =>
    api.get("/api/product/new", {
        params: { page, size }
    });

export const getProductById = (id) =>
    api.get(`/api/product/${id}`);

export const searchProducts = (name, page = 0, size = 10) =>
    api.get("/api/product/search", {
        params: { name, page, size }
    });

export const getProductsByCategory = (categoryId, page = 0, size = 10) =>
    api.get(`/api/product/category/${categoryId}`, {
        params: { page, size }
    });

// SELLER
export const getSellerProducts = (
    sellerId,
    page = 0,
    size = 50
) =>
    api.get(
        `/api/product/seller/${sellerId}?page=${page}&size=${size}`
    );

export const getSellerPendingProducts = (
    sellerId,
    page = 0,
    size = 10
) =>
    api.get(`/api/product/seller/${sellerId}/pending`, {
        params: { page, size }
    });

// ADMIN
export const createProduct = (product) =>
    api.post("/api/product", product);

export const updateProduct = (id, product) =>
    api.put(`/api/product/${id}`, product);

export const deleteProduct = (id) =>
    api.delete(`/api/product/${id}`);

export const getAdminPendingProducts = (page = 0, size = 10) =>
    api.get("/api/product/admin/pending", {
        params: { page, size }
    });

export const approveProduct = (id) =>
    api.put(`/api/product/${id}/approve`);

export const rejectProduct = (id) =>
    api.put(`/api/product/${id}/reject`);
