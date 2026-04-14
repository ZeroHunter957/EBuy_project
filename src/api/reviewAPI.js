import api from "./axios";

export const getReviewsByProduct = (productId) =>
    api.get(`/api/review/product/${productId}`);

export const getReviewsBySeller = () =>
    api.get("/api/review/seller/me");

export const addReview = (review) =>
    api.post("/api/review", review);
