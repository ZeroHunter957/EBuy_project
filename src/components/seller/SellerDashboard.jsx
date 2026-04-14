import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerLayout from "./SellerLayout";
import { getSellerProducts, getSellerPendingProducts } from "../../api/productAPI";
import { getSellerCheckouts } from "../../api/checkoutAPI";
import { toAbsoluteApiUrl } from "../../api/config";
import { toast } from "react-toastify";

export default function SellerDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [products, setProducts] = useState([]);
    const [tab, setTab] = useState("ALL");
    const [pendingCount, setPendingCount] = useState(0);
    const [orders, setOrders] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [sortKey, setSortKey] = useState("id_desc");

    const load = useCallback(async () => {
        if (!user) return;

        const [pRes, pendingRes, ordersRes] = await Promise.all([
            getSellerProducts(user.id, 0, 100),
            getSellerPendingProducts(user.id, 0, 1),
            getSellerCheckouts()
        ]);

        setProducts(pRes.data.content || []);
        setPendingCount(pendingRes.data?.totalElements ?? 0);
        setOrders(ordersRes.data || []);
    }, [user]);

    const totalRevenue = orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0);
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;

    useEffect(() => {
        load();
    }, [load]);

    const getStatus = (p) => p?.status?.name ?? p?.status ?? "";
    const isRejected = (p) => getStatus(p) === "REJECTED";

    const filtered = products
        .filter((p) => {
            if (tab === "ALL") return true;
            if (tab === "PENDING") return getStatus(p) === "PENDING";
            if (tab === "APPROVED") return getStatus(p) === "APPROVED";
            if (tab === "REJECTED") return getStatus(p) === "REJECTED";
            return true;
        })
        .filter((p) => {
            if (!searchName.trim()) return true;
            return (p.name || "").toLowerCase().includes(searchName.trim().toLowerCase());
        })
        .sort((a, b) => {
            const va = a ?? {};
            const vb = b ?? {};
            const get = (obj, key) => obj?.[key];

            if (sortKey === "price_asc") return get(va, "price") - get(vb, "price");
            if (sortKey === "price_desc") return get(vb, "price") - get(va, "price");
            if (sortKey === "stock_asc") return get(va, "stock") - get(vb, "stock");
            if (sortKey === "stock_desc") return get(vb, "stock") - get(va, "stock");
            if (sortKey === "id_asc") return (get(va, "id") ?? 0) - (get(vb, "id") ?? 0);
            return (get(vb, "id") ?? 0) - (get(va, "id") ?? 0);
        });

    const badge = (s) => {
        if (s === "PENDING") return "badge bg-warning";
        if (s === "APPROVED") return "badge bg-success";
        if (s === "REJECTED") return "badge bg-danger";
        return "badge bg-secondary";
    };

    const getImageUrl = (p) => {
        if (!p.images || p.images.length === 0) return null;

        const primary = p.images.find((i) => i.primary) || p.images[0];
        if (!primary?.imageUrl) return null;

        return toAbsoluteApiUrl(primary.imageUrl);
    };

    return (
        <SellerLayout>
            <h2 className="mb-4">Dashboard</h2>

            <div className="row g-3 mb-4">
                <div className="col-md-3 col-6">
                    <div className="card text-center p-3 shadow-sm border-0" style={{ background: "#e8f5e9" }}>
                        <div style={{ fontSize: 28 }}>💰</div>
                        <div className="text-muted" style={{ fontSize: 13 }}>Revenue</div>
                        <div className="fw-bold fs-5">${totalRevenue.toFixed(2)}</div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card text-center p-3 shadow-sm border-0" style={{ background: "#e3f2fd" }}>
                        <div style={{ fontSize: 28 }}>📦</div>
                        <div className="text-muted" style={{ fontSize: 13 }}>Order total</div>
                        <div className="fw-bold fs-5">{orders.length}</div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card text-center p-3 shadow-sm border-0" style={{ background: "#fff8e1" }}>
                        <div style={{ fontSize: 28 }}>🕐</div>
                        <div className="text-muted" style={{ fontSize: 13 }}>Pending orders</div>
                        <div className="fw-bold fs-5">{pendingOrders}</div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card text-center p-3 shadow-sm border-0" style={{ background: "#f3e5f5" }}>
                        <div style={{ fontSize: 28 }}>✅</div>
                        <div className="text-muted" style={{ fontSize: 13 }}>Delivered orders</div>
                        <div className="fw-bold fs-5">{deliveredOrders}</div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">My Products</h4>
                <a className="btn btn-sm btn-outline-primary" href="/seller/orders">
                    View Orders →
                </a>
            </div>

            {pendingCount > 0 && (
                <div className="alert alert-warning py-2">
                    There are <strong>{pendingCount}</strong> Pending Products.
                </div>
            )}

            <div className="mb-3">
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((t) => (
                    <button
                        key={t}
                        className={tab === t ? "btn btn-primary me-2" : "btn btn-outline-primary me-2"}
                        onClick={() => setTab(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="card p-3 mb-3">
                <div className="row g-2 align-items-center">
                    <div className="col-md-5">
                        <input
                            className="form-control"
                            placeholder="Search by name..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <select className="form-select" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                            <option value="id_desc">Sort: Newest</option>
                            <option value="id_asc">Sort: Oldest</option>
                            <option value="price_asc">Sort: Price (asc)</option>
                            <option value="price_desc">Sort: Price (desc)</option>
                            <option value="stock_asc">Sort: Stock (asc)</option>
                            <option value="stock_desc">Sort: Stock (desc)</option>
                        </select>
                    </div>
                    <div className="col-md-3 text-end">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setSearchName("");
                                setSortKey("id_desc");
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="row">
                {filtered.map((p) => (
                    <div key={p.id} className="col-lg-4 col-md-6">
                        <div className="card mb-3 shadow">
                            {getImageUrl(p) && (
                                <img
                                    src={getImageUrl(p)}
                                    alt={p.name}
                                    className="card-img-top"
                                    style={{ height: 180, objectFit: "cover" }}
                                />
                            )}

                            <div className="card-body">
                                <h5>{p.name}</h5>

                                <div>
                                    <span className={badge(getStatus(p))}>{getStatus(p)}</span>
                                </div>

                                <div>Price: ${p.price}</div>
                                <div>Stock: {p.stock}</div>
                                <div>
                                    {p.available ? (
                                        <span className="badge bg-success">Enabled</span>
                                    ) : (
                                        <span className="badge bg-danger">Disabled</span>
                                    )}
                                </div>

                                <div className="mt-2 d-flex gap-2">
                                    <button
                                        className={isRejected(p) ? "btn btn-sm btn-secondary" : "btn btn-sm btn-outline-dark"}
                                        disabled={isRejected(p)}
                                        title={isRejected(p) ? "Rejected product cannot be edited" : ""}
                                        onClick={() => {
                                            if (getStatus(p) === "REJECTED") {
                                                toast.warn("Rejected products cannot be edited");
                                                return;
                                            }

                                            navigate(`/seller/products/edit/${p.id}`);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </SellerLayout>
    );
}
