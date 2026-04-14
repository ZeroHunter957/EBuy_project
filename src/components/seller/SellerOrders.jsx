import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getSellerCheckouts } from "../../api/checkoutAPI";
import SellerLayout from "./SellerLayout";

export default function SellerOrders() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const sellerId = user?.id;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterProductId, setFilterProductId] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await getSellerCheckouts();
                if (!mounted) return;
                setOrders(res.data || []);
            } catch {
                if (!mounted) return;
                setOrders([]);
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    const sellerProductOptions = (() => {
        const map = new Map();
        (orders || []).forEach((o) => {
            (o.items || []).forEach((it) => {
                const pid = it?.product?.id;
                const sid = it?.product?.seller?.id;
                if (sellerId && sid === sellerId && pid != null) {
                    map.set(pid, { id: pid, name: it.product.name });
                }
            });
        });
        return Array.from(map.values());
    })();

    const statusBadge = (status) => {
        const s = (status ?? "PENDING").toString();
        if (s === "PENDING") return <span className="badge bg-warning text-dark">{s}</span>;
        if (s === "CONFIRMED") return <span className="badge bg-primary">{s}</span>;
        if (s === "SHIPPED") return <span className="badge bg-info text-dark">{s}</span>;
        if (s === "DELIVERED") return <span className="badge bg-success">{s}</span>;
        if (s === "CANCELLED") return <span className="badge bg-danger">{s}</span>;
        return <span className="badge bg-secondary">{s}</span>;
    };

    const paymentBadge = (ps) => {
        if (ps === "PAID") return <span className="badge bg-success">PAID</span>;
        return <span className="badge bg-secondary">{ps || "UNPAID"}</span>;
    };

    const filteredOrders = (orders || [])
        .filter((o) => {
            if (filterProductId === "all") return true;
            const pid = Number(filterProductId);
            return (o.items || []).some(
                (it) =>
                    it?.product?.seller?.id === sellerId &&
                    it?.product?.id === pid
            );
        })
        .filter((o) => {
            if (filterStatus === "all") return true;
            return (o.status ?? "PENDING") === filterStatus;
        });

    return (
        <SellerLayout>
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Seller Orders</h2>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/seller")}
                    >
                        Back
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="text-muted">
                        No orders for your products.
                    </div>
                ) : (
                    <>
                        <div className="card p-3 mb-3">
                            <div className="row g-2 align-items-center">
                                {sellerProductOptions.length > 0 && (
                                    <div className="col-md-5">
                                        <label className="form-label">
                                            Filter by product
                                        </label>
                                        <select
                                            className="form-select"
                                            value={filterProductId}
                                            onChange={(e) =>
                                                setFilterProductId(e.target.value)
                                            }
                                        >
                                            <option value="all">All products</option>
                                            {sellerProductOptions.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Filter by status
                                    </label>
                                    <select
                                        className="form-select"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">All</option>
                                        <option value="PENDING">PENDING</option>
                                        <option value="CONFIRMED">CONFIRMED</option>
                                        <option value="SHIPPED">SHIPPED</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Total</th>
                                    <th>Order date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-muted"
                                        >
                                            No valid orders
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((o) => (
                                        <tr key={o.id}>
                                            <td>#{o.id}</td>
                                            <td>{statusBadge(o.status)}</td>
                                            <td>
                                                {paymentBadge(o.paymentStatus)}
                                                <div className="text-muted" style={{ fontSize: 11 }}>
                                                    {o.paymentMethod || ""}
                                                </div>
                                            </td>
                                            <td>
                                                ${Number(o.totalAmount ?? 0).toFixed(2)}
                                            </td>
                                            <td>
                                                {o.orderDate
                                                    ? new Date(o.orderDate).toLocaleString("vi-VN")
                                                    : "—"}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() =>
                                                        navigate(`/seller/orders/${o.id}`)
                                                    }
                                                >
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </SellerLayout>
    );
}

