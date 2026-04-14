import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../api/authAPI";
import { getSellerPendingProducts } from "../../api/productAPI";

export default function SellerLayout({ children }) {

    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem("user"));
    const [pendingCount, setPendingCount] = useState(0);

    const isActive = (path) => {
        if (path === "/seller") return location.pathname === "/seller";
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            try {
                const res = await getSellerPendingProducts(
                    user.id,
                    0,
                    1
                );
                setPendingCount(res.data?.totalElements ?? 0);
            } catch {
                setPendingCount(0);
            }
        };

        load();
        // user won't change during session
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (

        <div style={{ display: "flex", minHeight: "100vh" }}>

            {/* SIDEBAR */}

            <div style={styles.sidebar}>

                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Seller Panel</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                        {user?.username || user?.email || "Seller"}
                    </div>
                </div>

                <hr style={{ borderColor: "#4b5563", margin: "0 0 8px" }} />

                <button
                    style={styles.btn}
                    onClick={() => navigate("/")}
                >
                    🏠 Home
                </button>

                <button
                    style={styles.btn}
                    onClick={() => navigate("/shop")}
                >
                    🛍️ Shop
                </button>

                <hr style={{ borderColor: "#4b5563", margin: "4px 0" }} />

                <button
                    style={{ ...styles.btn, ...(isActive("/seller") ? styles.btnActive : {}) }}
                    onClick={() => navigate("/seller")}
                >
                    📊 Dashboard
                    {pendingCount > 0 && (
                        <span className="badge bg-warning text-dark ms-2">
                            {pendingCount}
                        </span>
                    )}
                </button>

                <button
                    style={{ ...styles.btn, ...(isActive("/seller/orders") ? styles.btnActive : {}) }}
                    onClick={() => navigate("/seller/orders")}
                >
                    📦 Orders
                </button>

                <button
                    style={{ ...styles.btn, ...(isActive("/seller/create-product") ? styles.btnActive : {}) }}
                    onClick={() => navigate("/seller/create-product")}
                >
                    ➕ Add a product
                </button>

                <button
                    style={{ ...styles.btn, ...(isActive("/seller/reviews") ? styles.btnActive : {}) }}
                    onClick={() => navigate("/seller/reviews")}
                >
                    ⭐ Reviews
                </button>

                <div style={{ flex: 1 }} />

                <button
                    style={{ ...styles.btn, background: "#7f1d1d" }}
                    onClick={() => {
                        logout();
                        navigate("/login");
                    }}
                >
                    🚪 Logout
                </button>

            </div>


            {/* CONTENT */}

            <div style={styles.content}>

                {children}

            </div>

        </div>

    );

}

const styles = {

    sidebar: {
        width: 220,
        background: "#1f2937",
        color: "white",
        padding: 15,
        display: "flex",
        flexDirection: "column",
        gap: 10
    },

    btn: {
        background: "#374151",
        border: "none",
        color: "white",
        padding: "10px 12px",
        borderRadius: 6,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.2s",
    },

    btnActive: {
        background: "#2563eb",
        fontWeight: 700,
    },

    content: {
        flex: 1,
        padding: 20,
        background: "#f3f4f6"
    }

};