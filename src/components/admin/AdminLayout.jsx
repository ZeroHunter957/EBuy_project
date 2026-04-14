import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../api/authAPI";
import { getUnreadFeedbackCount } from "../../api/feedbackAPI";
import { getAdminPendingProducts } from "../../api/productAPI";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminLayout() {
    const navigate = useNavigate();
    const [feedbackCount, setFeedbackCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        getUnreadFeedbackCount()
            .then((res) => setFeedbackCount(res.data?.count ?? 0))
            .catch(() => setFeedbackCount(0));
    }, []);

    useEffect(() => {
        let intervalId;

        const refreshPendingCount = async () => {
            try {
                const res = await getAdminPendingProducts(0, 1);
                setPendingCount(res.data?.totalElements ?? 0);
            } catch {
                setPendingCount(0);
            }
        };

        // initial load
        refreshPendingCount();

        // auto refresh badge while admin is staying on admin pages
        intervalId = setInterval(refreshPendingCount, 5000);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="container-fluid">
            <div className="row min-vh-100">
                {/* Sidebar */}
                <nav className="col-md-3 col-lg-2 bg-dark text-white p-3">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">Admin Panel</h4>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-light position-relative"
                            onClick={() => navigate("/admin/products/pending")}
                        >
                            <span role="img" aria-label="notifications">
                                🔔
                            </span>
                            {pendingCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <ul className="nav flex-column">
                        <NavItem label="Dashboard" path="/admin" />
                        <NavItem label="Products" path="/admin/products" />
                        <NavItem
                            label="Pending Products"
                            path="/admin/products/pending"
                            badgeCount={pendingCount}
                        />
                        <NavItem
                            label="Categories"
                            path="/admin/categories"
                        />
                        <NavItem label="Orders" path="/admin/orders" />
                        <NavItem label="Users" path="/admin/users" />
                        <NavItem label="Verify Sellers" path="/admin/pending-verifications" />
                        <NavItem
                            label="Feedback"
                            path="/admin/feedback"
                            badgeCount={feedbackCount}
                        />
                    </ul>

                    <button
                        className="btn btn-outline-danger w-100 mt-4"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </nav>

                {/* Page content */}
                <main className="col-md-9 col-lg-10 bg-light p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function NavItem({ label, path, badgeCount }) {
    const navigate = useNavigate();
    return (
        <li className="nav-item mb-2">
            <button
                className="btn btn-link text-white text-start w-100"
                onClick={() => navigate(path)}
            >
                {label}
                {badgeCount > 0 && (
                    <span className="ms-2 badge rounded-pill bg-danger">
                        {badgeCount}
                    </span>
                )}
            </button>
        </li>
    );
}
