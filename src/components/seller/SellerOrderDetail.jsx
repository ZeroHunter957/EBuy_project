import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getSellerCheckoutById,
    updateSellerOrderStatus,
} from "../../api/checkoutAPI";
import { toast } from "react-toastify";
import OrderTimeline from "../OrderTimeline";

import SellerLayout from "./SellerLayout";

export default function SellerOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderStatus, setOrderStatus] = useState("");
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getSellerCheckoutById(id);
            setOrder(res.data || null);
            setOrderStatus(res.data?.status || "PENDING");
        } catch {
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStatus = async () => {
        setSaving(true);
        try {
            await updateSellerOrderStatus(order.id, orderStatus);
            toast.success("Order's status updated");
            await load();
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.response?.data || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if (!order) {
        return (
            <SellerLayout>
                <div className="text-muted">
                    Order not found or no permission.
                </div>
            </SellerLayout>
        );
    }

    const sellerItems = (order.items || []).filter((it) => {
        // If sellerId is missing (shouldn't happen), fallback to all items.
        if (!user?.id) return true;
        return it.product?.seller?.id === user.id;
    });

    return (
        <SellerLayout>
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Order #{order.id}</h2>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/seller/orders")}
                    >
                        Back
                    </button>
                </div>

                <div className="card p-3 mb-3">
                    <OrderTimeline status={order.status} />
                </div>

                <div className="card p-3 mb-3">
                    <div className="d-flex gap-3 flex-wrap align-items-end">
                        <div>
                            <div className="text-muted mb-1">Order's status</div>
                            {order.status === "CANCELLED" ? (
                                <span className="badge bg-danger">CANCELLED</span>
                            ) : (
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select"
                                        style={{ width: 200 }}
                                        value={orderStatus}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="CONFIRMED">CONFIRMED</option>
                                        <option value="SHIPPED">SHIPPED</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                    </select>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={handleSaveStatus}
                                        disabled={saving || orderStatus === order.status}
                                    >
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="text-muted">Total</div>
                            <div className="fw-bold">
                                ${Number(order.totalAmount ?? 0).toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted">Order date</div>
                            <div>
                                {order.orderDate
                                    ? new Date(order.orderDate).toLocaleString("vi-VN")
                                    : "—"}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted">Payment</div>
                            <div>
                                <span className={`badge ${order.paymentStatus === "PAID" ? "bg-success" : "bg-secondary"}`}>
                                    {order.paymentStatus || "UNPAID"}
                                </span>{" "}
                                <small className="text-muted">{order.paymentMethod || ""}</small>
                            </div>
                        </div>
                    </div>
                </div>

                {(order.shippingFullName || order.shippingPhone || order.shippingAddress) && (
                    <div className="card p-3 mb-3">
                        <h5 className="mb-2">Shipping info</h5>
                        <div className="d-flex gap-3 flex-wrap">
                            <div>
                                <div className="text-muted">Full name</div>
                                <div>{order.shippingFullName || "—"}</div>
                            </div>
                            <div>
                                <div className="text-muted">Phone</div>
                                <div>{order.shippingPhone || "—"}</div>
                            </div>
                            <div>
                                <div className="text-muted">Address</div>
                                <div>{order.shippingAddress || "—"}</div>
                            </div>
                        </div>
                    </div>
                )}

                <h4>Items (from your products)</h4>
                <table className="table table-striped mt-2">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th style={{ width: 140 }}>Unit price</th>
                            <th style={{ width: 120 }}>Quantity</th>
                            <th style={{ width: 160 }}>Line total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sellerItems.map((it) => (
                            <tr key={it.id}>
                                <td>
                                    {it.product?.name ?? `#${it.product?.id}`}
                                </td>
                                <td>${Number(it.unitPrice ?? 0).toFixed(2)}</td>
                                <td>{it.quantity ?? 0}</td>
                                <td>
                                    $
                                    {Number(it.quantity ?? 0) *
                                        Number(it.unitPrice ?? 0) ? (
                                        (
                                            Number(it.quantity ?? 0) *
                                            Number(it.unitPrice ?? 0)
                                        ).toFixed(2)
                                    ) : (
                                        "0.00"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SellerLayout>
    );
}

