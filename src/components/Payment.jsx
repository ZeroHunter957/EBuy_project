import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyCart } from "../api/cartAPI";
import { checkoutFromCartWithPayment } from "../api/checkoutAPI";
import { toast } from "react-toastify";
import CheckoutStepper from "./CheckoutStepper";
import { toAbsoluteApiUrl } from "../api/config";

export default function Payment() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        shippingFullName: "",
        shippingPhone: "",
        shippingAddress: "",
        paymentMethod: "COD",
    });

    useEffect(() => {
        getMyCart()
            .then((res) => setCart(res.data))
            .catch(() => setCart(null))
            .finally(() => setLoading(false));
    }, []);

    const items = cart?.items || [];

    const getThumb = (product) => {
        const img = product?.images?.find((i) => i.primary) || product?.images?.[0];
        return img?.imageUrl ? toAbsoluteApiUrl(img.imageUrl) : null;
    };

    const total = items.reduce((sum, it) => {
        const qty = Number(it.quantity ?? 0);
        const price = Number(it.price ?? it.product?.price ?? 0);
        return sum + qty * price;
    }, 0);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const isValidPhone = (phone) => /^(0[3-9][0-9]{8}|84[3-9][0-9]{8})$/.test(phone.trim());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.shippingFullName || !form.shippingPhone || !form.shippingAddress) {
            toast.warn("Please fill out all fields for your order");
            return;
        }
        if (!isValidPhone(form.shippingPhone)) {
            toast.warn("Invalid phone number (Example: 0912345678)");
            return;
        }
        setSubmitting(true);
        try {
            const res = await checkoutFromCartWithPayment(form);
            const orderId = res.data?.id;
            window.dispatchEvent(new Event("cart-updated"));
            navigate(orderId ? `/order-success/${orderId}` : "/checkout");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to place order";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-4">
                <div className="text-center py-5">Loading...</div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container py-4">
                <h2>Checkout</h2>
                <div className="alert alert-info mt-3">
                    Cart is empty.{" "}
                    <span
                        style={{ cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => navigate("/shop")}
                    >
                        Continue to shop
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <CheckoutStepper current={1} />
            <h2 className="mb-4">Checkout</h2>

            <div className="row g-4">
                {/* ===== LEFT: shipping + payment form ===== */}
                <div className="col-md-7">
                    <form onSubmit={handleSubmit}>
                        <div className="card p-4 mb-3">
                            <h5 className="mb-3">Delivery information</h5>

                            <div className="mb-3">
                                <label className="form-label">Full name</label>
                                <input
                                    className="form-control"
                                    name="shippingFullName"
                                    value={form.shippingFullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Phone number</label>
                                <input
                                    className="form-control"
                                    name="shippingPhone"
                                    type="tel"
                                    placeholder="Example: 0912345678"
                                    value={form.shippingPhone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Shipping address</label>
                                <textarea
                                    className="form-control"
                                    name="shippingAddress"
                                    rows={3}
                                    value={form.shippingAddress}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="card p-4 mb-3">
                            <h5 className="mb-3">Payment method</h5>
                            <div className="d-flex align-items-center gap-2">
                                <span style={{ fontSize: 20 }}>&#128181;</span>
                                <span>Cash on delivery (COD)</span>
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate("/cart")}
                            >
                                Return to cart
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-4"
                                disabled={submitting}
                            >
                                {submitting ? "Submitting..." : "Confirm order"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ===== RIGHT: order summary ===== */}
                <div className="col-md-5">
                    <div className="card p-4">
                        <h5 className="mb-3">Your order</h5>

                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th className="text-end">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((it) => {
                                    const qty = Number(it.quantity ?? 0);
                                    const price = Number(
                                        it.price ?? it.product?.price ?? 0
                                    );
                                    const thumb = getThumb(it.product);
                                    return (
                                        <tr key={it.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {thumb ? (
                                                        <img
                                                            src={thumb}
                                                            alt=""
                                                            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: 40, height: 40, background: "#f0f0f0", borderRadius: 4 }} />
                                                    )}
                                                    <div>
                                                        {it.product?.name ||
                                                            `#${it.product?.id}`}{" "}
                                                        <span className="text-muted">
                                                            x{qty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                ${(qty * price).toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <hr />
                        <div className="d-flex justify-content-between fw-bold fs-5">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
