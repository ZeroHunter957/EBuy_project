import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getCheckoutById,
    updateCheckoutStatus,
    updatePaymentStatus
} from "../../../api/checkoutAPI";
import { toast } from "react-toastify";

export default function AdminOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const res = await getCheckoutById(id);
            setOrder(res.data);
            setStatus(res.data?.status ?? "");
            setPaymentStatus(res.data?.paymentStatus ?? "UNPAID");
        } catch {
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSaveStatus = async () => {
        try {
            await updateCheckoutStatus(id, status);
            await load();
            toast.success("Order updated");
        } catch {
            toast.error("Update order status failed");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-4">Loading...</div>
        );
    }

    if (!order) {
        return (
            <div className="text-muted">
                Order not found or no permission.
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Order #{order.id}</h2>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/admin/orders")}
                >
                    Back
                </button>
            </div>

            <div className="card p-3 mb-3">
                <div className="d-flex gap-3 flex-wrap">
                    <div>
                        <div className="text-muted">User</div>
                        <div>{order.user?.username ?? order.user?.email ?? "—"}</div>
                    </div>
                    <div>
                        <div className="text-muted">Total</div>
                        <div>${Number(order.totalAmount ?? 0).toFixed(2)}</div>
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
                        <div className="text-muted">Payment method</div>
                        <div>{order.paymentMethod || "—"}</div>
                    </div>
                    <div>
                        <div className="text-muted">Payment status</div>
                        <div>
                            <span className={`badge ${order.paymentStatus === "PAID" ? "bg-success" : "bg-secondary"}`}>
                                {order.paymentStatus || "UNPAID"}
                            </span>
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

            <div className="card p-3 mb-3">
                <div className="d-flex gap-2 align-items-center flex-wrap mb-2">
                    <label>Order Status</label>
                    <select
                        className="form-select w-auto"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button
                        className="btn btn-primary"
                        onClick={handleSaveStatus}
                    >
                        Save
                    </button>
                </div>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                    <label>Payment Status</label>
                    <select
                        className="form-select w-auto"
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                        <option value="UNPAID">UNPAID</option>
                        <option value="PAID">PAID</option>
                    </select>
                    <button
                        className="btn btn-success"
                        onClick={async () => {
                            try {
                                await updatePaymentStatus(id, paymentStatus);
                                await load();
                                toast.success("Payment status updated");
                            } catch {
                                toast.error("Update payment status failed");
                            }
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>

            <h4>Items</h4>
            <table className="table table-striped mt-2">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th style={{ width: 120 }}>Unit price</th>
                        <th style={{ width: 120 }}>Quantity</th>
                        <th style={{ width: 140 }}>Line total</th>
                    </tr>
                </thead>
                <tbody>
                    {(order.items || []).map((it) => (
                        <tr key={it.id}>
                            <td>{it.product?.name ?? `#${it.product?.id}`}</td>
                            <td>${Number(it.unitPrice ?? 0).toFixed(2)}</td>
                            <td>{it.quantity ?? 0}</td>
                            <td>
                                $
                                {Number(it.quantity ?? 0) *
                                    Number(it.unitPrice ?? 0) ? (
                                    (Number(it.quantity ?? 0) *
                                        Number(it.unitPrice ?? 0)).toFixed(2)
                                ) : (
                                    "0.00"
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

