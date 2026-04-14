import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCheckoutsByUser } from "../api/checkoutAPI";
import CheckoutStepper from "./CheckoutStepper";
import { toAbsoluteApiUrl } from "../api/config";

export default function OrderSuccess() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (!user) return;
        getCheckoutsByUser(user.id)
            .then((res) => {
                const found = (res.data || []).find(
                    (o) => String(o.id) === String(orderId)
                );
                setOrder(found || null);
            })
            .catch(() => setOrder(null));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const getThumb = (product) => {
        const img = product?.images?.find((i) => i.primary) || product?.images?.[0];
        return img?.imageUrl ? toAbsoluteApiUrl(img.imageUrl) : null;
    };

    const paymentMethodLabel = (m) => {
        if (m === "COD") return "Cash on delivery (COD)";
        if (m === "BANK_TRANSFER") return "Bank transfer";
        if (m === "CREDIT_CARD") return "Credit / Debit card";
        return m || "—";
    };

    return (
        <div className="container py-5">
            <CheckoutStepper current={2} />
            <div className="text-center mb-4">
                <div style={{ fontSize: 64, color: "#28a745" }}>&#10004;</div>
                <h2 className="mt-2">Order placed successfully!</h2>
                <p className="text-muted">
                    Thank you for purchasing. Order #{orderId} has been made.
                </p>
            </div>

            {order && (
                <div className="card p-4 mx-auto" style={{ maxWidth: 600 }}>
                    <h5 className="mb-3">Order information</h5>

                    <div className="row mb-2">
                        <div className="col-5 text-muted">Order Id</div>
                        <div className="col-7 fw-bold">#{order.id}</div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-5 text-muted">Total price</div>
                        <div className="col-7 fw-bold">
                            ${Number(order.totalAmount ?? 0).toFixed(2)}
                        </div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-5 text-muted">Payment method</div>
                        <div className="col-7">
                            {paymentMethodLabel(order.paymentMethod)}
                        </div>
                    </div>
                    {order.shippingFullName && (
                        <div className="row mb-2">
                            <div className="col-5 text-muted">Recipient</div>
                            <div className="col-7">{order.shippingFullName}</div>
                        </div>
                    )}
                    {order.shippingPhone && (
                        <div className="row mb-2">
                            <div className="col-5 text-muted">Phone number</div>
                            <div className="col-7">{order.shippingPhone}</div>
                        </div>
                    )}
                    {order.shippingAddress && (
                        <div className="row mb-2">
                            <div className="col-5 text-muted">Shipping address</div>
                            <div className="col-7">{order.shippingAddress}</div>
                        </div>
                    )}

                    <hr />
                    <h6>Products</h6>
                    {(order.items || []).map((it) => {
                        const thumb = getThumb(it.product);
                        return (
                            <div
                                key={it.id}
                                className="d-flex justify-content-between align-items-center py-1"
                            >
                                <div className="d-flex align-items-center gap-2">
                                    {thumb ? (
                                        <img
                                            src={thumb}
                                            alt=""
                                            style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }}
                                        />
                                    ) : (
                                        <div style={{ width: 36, height: 36, background: "#f0f0f0", borderRadius: 4 }} />
                                    )}
                                    <span>
                                        {it.product?.name || `#${it.product?.id}`}{" "}
                                        <span className="text-muted">x{it.quantity}</span>
                                    </span>
                                </div>
                                <span>
                                    ${(Number(it.unitPrice ?? 0) * Number(it.quantity ?? 0)).toFixed(2)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="text-center mt-4 d-flex justify-content-center gap-3">
                <button
                    className="btn btn-primary px-4"
                    onClick={() => navigate("/checkout")}
                >
                    View my orders
                </button>
                <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => navigate("/shop")}
                >
                    Continue shopping
                </button>
            </div>
        </div>
    );
}
