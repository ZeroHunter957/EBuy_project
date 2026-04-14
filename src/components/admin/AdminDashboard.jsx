import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../api/productAPI";
import { getAllCategories } from "../../api/categoryAPI";
import { getAllCheckouts } from "../../api/checkoutAPI";
import { getAllUsers } from "../../api/UserAPI";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        orders: 0,
        users: 0,
        sellers: 0,
        revenue: 0
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [statusStats, setStatusStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsRes, categoriesRes, ordersRes, usersRes] = await Promise.all([
                getAllProducts(),
                getAllCategories(),
                getAllCheckouts(),
                getAllUsers()
            ]);

            const normalize = (res) => (Array.isArray(res.data) ? res.data : res.data.content || []);

            const products = normalize(productsRes);
            const categories = normalize(categoriesRes);
            const orders = normalize(ordersRes);
            const users = normalize(usersRes);

            const sellers = users.filter((u) => u.role?.name === "SELLER");
            const normalUsers = users.filter((u) => u.role?.name === "USER");

            const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

            const sortedOrders = [...orders]
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                .slice(0, 5);

            setRecentOrders(sortedOrders);

            const statusMap = {};
            orders.forEach((o) => {
                statusMap[o.status] = (statusMap[o.status] || 0) + 1;
            });
            setStatusStats(statusMap);

            setStats({
                products: productsRes.data.totalElements,
                categories: categories.length,
                orders: orders.length,
                users: normalUsers.length,
                sellers: sellers.length,
                revenue: totalRevenue
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role.name !== "ADMIN") {
        navigate("/login");
        return null;
    }

    function getStatusColor(status) {
        switch (status) {
            case "DELIVERED": return "success";
            case "SHIPPED": return "primary";
            case "PENDING": return "warning";
            case "CONFIRMED": return "info";
            case "CANCELLED": return "danger";
            default: return "secondary";
        }
    }

    return (
        <div className="container-fluid bg-light min-vh-100 p-4">
            <h2 className="mb-3">Admin Dashboard</h2>
            <p className="text-muted">Welcome back, {user.username}</p>

            {loading ? (
                <div className="text-center mt-5">Loading...</div>
            ) : (
                <>
                    <div className="row g-4 mb-4">
                        <StatCard title="Products" value={stats.products} />
                        <StatCard title="Categories" value={stats.categories} />
                        <StatCard title="Orders" value={stats.orders} />
                        <StatCard title="Users" value={stats.users} />
                        <StatCard title="Sellers" value={stats.sellers} />
                        <StatCard title="Revenue" value={`$${stats.revenue.toFixed(2)}`} />
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-6">
                            <div className="card p-3 shadow-sm">
                                <h5>Recent Orders</h5>
                                <table className="table table-sm mt-2">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {recentOrders.map((o) => (
                                        <tr key={o.id}>
                                            <td>{o.id}</td>
                                            <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                                            <td>
                                                    <span className={`badge bg-${getStatusColor(o.status)}`}>
                                                        {o.status}
                                                    </span>
                                            </td>
                                            <td>${o.totalAmount}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="col-lg-3">
                            <div className="card p-3 shadow-sm">
                                <h5>Order Status</h5>
                                {Object.entries(statusStats).map(([status, count]) => (
                                    <div key={status} className="d-flex justify-content-between mb-2">
                                        <span>{status}</span>
                                        <strong>{count}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div className="col-sm-6 col-lg-2">
            <div className="card shadow-sm text-center p-3">
                <h6 className="text-muted">{title}</h6>
                <h4>{value}</h4>
            </div>
        </div>
    );
}
