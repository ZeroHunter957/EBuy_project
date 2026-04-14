import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/authAPI";
import { getMyCart } from "../api/cartAPI";

export default function Header() {

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [cartCount, setCartCount] = useState(0);

    const loadCartCount = useCallback(() => {
        if (!user) return;
        getMyCart()
            .then((res) => {
                const items = res.data?.items || [];
                setCartCount(items.reduce((sum, it) => sum + Number(it.quantity ?? 0), 0));
            })
            .catch(() => setCartCount(0));
    }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        loadCartCount();
        const handler = () => loadCartCount();
        window.addEventListener("cart-updated", handler);
        return () => window.removeEventListener("cart-updated", handler);
    }, [loadCartCount]);

    const isSeller =
        user?.role?.name === "SELLER" ||
        user?.role === "SELLER";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (

        <div style={styles.header}>

            <div
                style={styles.logo}
                onClick={() => navigate("/")}
            >
                🛒 EBuy
            </div>

            <div style={styles.menu}>

                <button
                    style={styles.btn}
                    onClick={() => navigate("/")}
                >
                    Home
                </button>

                <button
                    style={styles.btn}
                    onClick={() => navigate("/shop")}
                >
                    Shop
                </button>

                {user && (
                    <>
                        <button
                            style={{ ...styles.btn, position: "relative" }}
                            onClick={() => navigate("/cart")}
                        >
                            Cart
                            {cartCount > 0 && (
                                <span style={styles.cartBadge}>{cartCount}</span>
                            )}
                        </button>
                        <button
                            style={styles.btn}
                            onClick={() => navigate("/checkout")}
                        >
                            Orders
                        </button>
                        <button
                            style={styles.btn}
                            onClick={() => navigate("/feedback")}
                        >
                            Feedback
                        </button>
                    </>
                )}

                {/* seller menu */}

                {isSeller && (
                    <>
                        <button
                            style={styles.btnPrimary}
                            onClick={() => navigate("/seller")}
                        >
                            Dashboard
                        </button>

                        <button
                            style={styles.btn}
                            onClick={() =>
                                navigate("/seller/create-product")
                            }
                        >
                            Create
                        </button>

                        <button
                            style={styles.btn}
                            onClick={() =>
                                navigate("/seller")
                            }
                        >
                            My products
                        </button>
                    </>
                )}

                {user && (
                    <button
                        style={styles.btnDanger}
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                )}

                {!user && (
                    <>
                        <button
                            style={styles.btnOutline}
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>

                        <button
                            style={styles.btnPrimary}
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </button>
                    </>
                )}

            </div>

        </div>

    );
}

const styles = {

    header: {
        position: "sticky",
        top: 0,
        zIndex: 1000,
        height: 60,
        background: "linear-gradient(90deg,#2575fc,#6a11cb)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
    },

    logo: {
        fontSize: 22,
        fontWeight: "bold",
        cursor: "pointer"
    },

    menu: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap"
    },

    btn: {
        background: "transparent",
        border: "none",
        color: "white",
        cursor: "pointer",
        padding: "6px 12px",
        borderRadius: 6,
        transition: "0.2s"
    },

    btnOutline: {
        background: "transparent",
        border: "1px solid white",
        color: "white",
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer"
    },

    btnPrimary: {
        background: "#ff9800",
        border: "none",
        color: "white",
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer"
    },

    btnDanger: {
        background: "#ff4d4d",
        border: "none",
        color: "white",
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer"
    },

    cartBadge: {
        position: "absolute",
        top: -4,
        right: -6,
        background: "#ff4d4d",
        color: "white",
        fontSize: 11,
        fontWeight: "bold",
        borderRadius: "50%",
        minWidth: 18,
        height: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
        lineHeight: 1
    }
};