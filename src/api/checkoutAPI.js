import api from "./axios";

export const getAllCheckouts = () =>
    api.get("/api/checkout");

export const getCheckoutsByUser = (userId) =>
    api.get(`/api/checkout/user/${userId}`);

export const createCheckout = (checkout) =>
    api.post("/api/checkout", checkout);

// Create checkout/order from current user's cart (legacy, no payment info)
export const checkoutFromCart = () =>
    api.post("/api/checkout/from-cart");

// Create checkout/order from cart with payment & shipping info
export const checkoutFromCartWithPayment = (paymentData) =>
    api.post("/api/checkout/from-cart-with-payment", paymentData);

// ===================== ADMIN/DETAIL =====================
export const getCheckoutById = (id) =>
    api.get(`/api/checkout/${id}`);

export const updateCheckoutStatus = (id, status) =>
    api.put(`/api/checkout/${id}/status`, { status });

export const updatePaymentStatus = (id, paymentStatus) =>
    api.put(`/api/checkout/${id}/payment-status`, { paymentStatus });

export const cancelOrder = (id) =>
    api.put(`/api/checkout/${id}/cancel`);

export const confirmDelivery = (id) =>
    api.put(`/api/checkout/${id}/confirm-delivery`);

// ===================== SELLER =====================
export const getSellerCheckouts = () =>
    api.get("/api/checkout/seller/me");

export const getSellerCheckoutById = (id) =>
    api.get(`/api/checkout/seller/${id}`);

export const updateSellerOrderStatus = (orderId, status) =>
    api.put(`/api/checkout/seller/${orderId}/status`, { status });
