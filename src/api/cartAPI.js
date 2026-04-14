import api from "./axios";

// Get logged-in user's cart
export const getMyCart = () =>
    api.get("/api/cart/my");

// Add or update cart item
export const addOrUpdateItem = (item) =>
    api.post("/api/cart/item", item);

// Increment quantity by delta (default: 1)
export const addItem = (productId, delta = 1) =>
    api.post("/api/cart/item/add", { productId, delta });

// Clear cart
export const clearCart = (cartId) =>
    api.delete(`/api/cart/${cartId}/clear`);
