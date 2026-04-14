import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCheckouts } from "../../../api/checkoutAPI";

export default function OrderList() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        getAllCheckouts().then((res) => setOrders(res.data));
    }, []);

    return (
        <>
            <h2>Orders</h2>

            <table className="table mt-3">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Total</th>
                    <th>Order Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {orders.map((o) => (
                    <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.user?.username ?? "—"}</td>
                        <td>${Number(o.totalAmount ?? 0).toFixed(2)}</td>
                        <td>
                                <span
                                    className={`badge ${
                                        o.status === "DELIVERED"
                                            ? "bg-success"
                                            : o.status === "CANCELLED"
                                                ? "bg-secondary"
                                                : o.status === "SHIPPED"
                                                    ? "bg-info"
                                                    : "bg-warning text-dark"
                                    }`}
                                >
                                    {o.status ?? "PENDING"}
                                </span>
                        </td>
                        <td>
                            <span className={`badge ${o.paymentStatus === "PAID" ? "bg-success" : "bg-secondary"}`}>
                                {o.paymentStatus || "UNPAID"}
                            </span>
                            <div style={{ fontSize: 11 }} className="text-muted">
                                {o.paymentMethod || "—"}
                            </div>
                        </td>
                        <td>
                            {o.orderDate
                                ? new Date(o.orderDate).toLocaleString("vi-VN")
                                : "—"}
                        </td>
                        <td>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/admin/orders/${o.id}`)}
                            >
                                Order details
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    );
}
