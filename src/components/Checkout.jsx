import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCheckoutsByUser, cancelOrder, confirmDelivery } from "../api/checkoutAPI";
import { toast } from "react-toastify";
import OrderTimeline from "./OrderTimeline";

export default function Checkout() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const statusBadge = (status) => {
        const s = (status ?? "PENDING").toString();
        if (s === "PENDING") return <span className="badge bg-warning text-dark">{s}</span>;
        if (s === "CONFIRMED") return <span className="badge bg-primary">{s}</span>;
        if (s === "SHIPPED") return <span className="badge bg-info text-dark">{s}</span>;
        if (s === "DELIVERED") return <span className="badge bg-success">{s}</span>;
        if (s === "CANCELLED") return <span className="badge bg-danger">{s}</span>;
        return <span className="badge bg-secondary">{s}</span>;
    };

    const paymentMethodLabel = (m) => {
        if (m === "COD") return "Cash on delivery";
        if (m === "BANK_TRANSFER") return "Bank transfer";
        if (m === "CREDIT_CARD") return "Credit / Debit card";
        return m || "—";
    };

    const paymentStatusBadge = (s) => {
        if (s === "PAID") return <span className="badge bg-success">PAID</span>;
        return <span className="badge bg-secondary">{s || "UNPAID"}</span>;
    };

    const load = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await getCheckoutsByUser(user.id);
            setOrders(res.data || []);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>My Orders</h2>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/cart")}
                >
                    Return to Cart
                </button>
            </div>

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : orders.length === 0 ? (
                <div className="text-muted">No Orders yet.</div>
            ) : (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Total cost</th>
                            <th>Order's Status</th>
                            <th>Checkout</th>
                            <th>Date Ordered</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <React.Fragment key={o.id}>
                                <tr>
                                    <td>{o.id}</td>
                                    <td>${Number(o.totalAmount ?? 0).toFixed(2)}</td>
                                    <td>{statusBadge(o.status)}</td>
                                    <td>
                                        {paymentStatusBadge(o.paymentStatus)}
                                        <div className="text-muted" style={{ fontSize: 12 }}>
                                            {paymentMethodLabel(o.paymentMethod)}
                                        </div>
                                    </td>
                                    <td>
                                        {o.orderDate
                                            ? new Date(o.orderDate).toLocaleString("vi-VN")
                                            : "—"}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() =>
                                                    setExpandedOrderId((prev) =>
                                                        prev === o.id ? null : o.id
                                                    )
                                                }
                                            >
                                                {expandedOrderId === o.id ? "Hide details" : "Show details"}
                                            </button>
                                            {(o.status ?? "PENDING") === "PENDING" && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={async () => {
                                                        if (!window.confirm("Are you sure you want to cancel this order?")) return;
                                                        try {
                                                            await cancelOrder(o.id);
                                                            toast.success("Order cancelled");
                                                            await load();
                                                        } catch {
                                                            toast.error("Cancelling failed");
                                                        }
                                                    }}
                                                >
                                                    Cancel order
                                                </button>
                                            )}
                                            {(o.status ?? "") === "SHIPPED" && (
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={async () => {
                                                        if (!window.confirm("Confirm you have received your order?")) return;
                                                        try {
                                                            await confirmDelivery(o.id);
                                                            toast.success("Order received and confirmed!");
                                                            await load();
                                                        } catch {
                                                            toast.error("Confirming failed");
                                                        }
                                                    }}
                                                >
                                                    ✓ Order received
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedOrderId === o.id && (
                                    <tr>
                                        <td colSpan="6">
                                            <OrderTimeline status={o.status} />

                                            {(o.shippingFullName || o.shippingPhone || o.shippingAddress) && (
                                                <div className="card p-3 mb-3 mt-2">
                                                    <h6>Information for your order</h6>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <small className="text-muted">Recipient</small>
                                                            <div>{o.shippingFullName || "—"}</div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <small className="text-muted">Phone number</small>
                                                            <div>{o.shippingPhone || "—"}</div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <small className="text-muted">Address</small>
                                                            <div>{o.shippingAddress || "—"}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <h6 className="mb-2">Products</h6>
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th style={{ width: 120 }}>Price</th>
                                                        <th style={{ width: 120 }}>Quantity</th>
                                                        <th style={{ width: 140 }}>Cost</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(o.items || []).map((it) => {
                                                        const qty = Number(it.quantity ?? 0);
                                                        const unit = Number(it.unitPrice ?? 0);
                                                        const lineTotal = qty * unit;
                                                        return (
                                                            <tr key={it.id}>
                                                                <td>{it.product?.name ?? `#${it.product?.id}`}</td>
                                                                <td>${unit.toFixed(2)}</td>
                                                                <td>{qty}</td>
                                                                <td>${lineTotal.toFixed(2)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
