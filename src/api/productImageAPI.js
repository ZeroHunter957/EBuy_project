import api from "./axios";

// ===================== PUBLIC =====================
export const getImagesByProduct = (productId) =>
    api.get(`/api/product-image/product/${productId}`);

export const getPrimaryImage = (productId) =>
    api.get(`/api/product-image/product/${productId}/primary`);

// ===================== ADMIN (upload, delete image) =====================
export const saveImage = (image) =>
    api.post("/api/product-image", image, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

export const deleteImage = (id) =>
    api.delete(`/api/product-image/${id}`);