import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyCart, addOrUpdateItem, clearCart } from "../api/cartAPI";
import { toast } from "react-toastify";
import CheckoutStepper from "./CheckoutStepper";
import { toAbsoluteApiUrl } from "../api/config";

export default function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qtyByItemId, setQtyByItemId] = useState({});

    const loadCart = async () => {
        setLoading(true);
        try {
            const res = await getMyCart();
            setCart(res.data);
            const next = {};
            (res.data?.items || []).forEach((it) => {
                next[it.id] = it.quantity;
            });
            setQtyByItemId(next);
        } catch (e) {
            setCart(null);
        } finally {
            setLoading(false);
            window.dispatchEvent(new Event("cart-updated"));
        }
    };

    useEffect(() => {
        loadCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdateQty = async (item) => {
        const newQty = qtyByItemId[item.id];
        if (newQty === undefined || newQty === null) return;

        if (newQty < 0) return;

        const stock = Number(item.product?.stock ?? 0);
        if (stock > 0 && Number(newQty) > stock) {
            toast.warn("Quantity exceeds available stock");
            return;
        }

        try {
            await addOrUpdateItem({
                cart: { id: cart.id },
                product: { id: item.product?.id },
                quantity: Number(newQty)
            });
            await loadCart();
        } catch {
            toast.error("Update cart item failed");
        }
    };

    const handleRemoveItem = async (item) => {
        try {
            await addOrUpdateItem({
                cart: { id: cart.id },
                product: { id: item.product?.id },
                quantity: 0,
            });
            toast.success("Đã xóa sản phẩm");
            await loadCart();
        } catch {
            toast.error("Xóa sản phẩm thất bại");
        }
    };

    const handleClear = async () => {
        if (!cart?.id) return;
        if (!window.confirm("Clear your cart?")) return;
        try {
            await clearCart(cart.id);
            await loadCart();
        } catch {
            toast.error("Clear cart failed");
        }
    };

    const handleCheckout = () => {
        navigate("/payment");
    };

    if (loading) {
        return (
            <div style={{ padding: 20 }}>
                <div className="text-center py-4">Loading...</div>
            </div>
        );
    }

    const items = cart?.items || [];

    const getThumb = (product) => {
        const img = product?.images?.find((i) => i.primary) || product?.images?.[0];
        return img?.imageUrl ? toAbsoluteApiUrl(img.imageUrl) : null;
    };

    const total = items.reduce((sum, it) => {
        const qty = Number(it.quantity ?? 0);
        const price = Number(it.product?.price ?? 0);
        return sum + qty * price;
    }, 0);

    return (
        <div style={{ padding: 20 }}>
            <CheckoutStepper current={0} />
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Your Cart</h2>
                <button className="btn btn-outline-danger" onClick={handleClear}>
                    Clear
                </button>
            </div>

            {items.length === 0 ? (
                <div className="text-muted">Cart is empty.</div>
            ) : (
                <div className="card p-3">
                    <table className="table table-borderless">
                        <thead>
                            <tr>
                                <th style={{ width: 60 }}></th>
                                <th>Product</th>
                                <th style={{ width: 120 }}>Price</th>
                                <th style={{ width: 140 }}>Quantity</th>
                                <th style={{ width: 140 }}>Subtotal</th>
                                <th style={{ width: 120 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it) => {
                                const price = Number(it.product?.price ?? 0);
                                const qty = Number(it.quantity ?? 0);
                                const thumb = getThumb(it.product);
                                return (
                                    <tr key={it.id}>
                                        <td>
                                            {thumb ? (
                                                <img
                                                    src={thumb}
                                                    alt=""
                                                    style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
                                                />
                                            ) : (
                                                <div style={{ width: 48, height: 48, background: "#f0f0f0", borderRadius: 6 }} />
                                            )}
                                        </td>
                                        <td>
                                            {it.product?.name || `#${it.product?.id}`}
                                        </td>
                                        <td>${price}</td>
                                        <td>
                                            <input
                                                className="form-control"
                                                type="number"
                                                min="0"
                                                step="1"
                                                max={
                                                    Number(it.product?.stock ?? 0) > 0
                                                        ? Number(it.product?.stock ?? 0)
                                                        : undefined
                                                }
                                                value={
                                                    qtyByItemId[it.id] ?? qty
                                                }
                                                onChange={(e) =>
                                                    setQtyByItemId((prev) => ({
                                                        ...prev,
                                                        [it.id]: e.target.value
                                                    }))
                                                }
                                            />
                                        </td>
                                        <td>${qty * price}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleUpdateQty(it)}
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Xóa"
                                                    onClick={() => handleRemoveItem(it)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="d-flex justify-content-end">
                        <div style={{ fontSize: 18, fontWeight: 700 }}>
                            Total: ${total}
                        </div>
                    </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/shop")}
                    >
                        Continue shopping
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleCheckout}
                    >
                        Checkout
                    </button>
                </div>
                </div>
            )}
        </div>
    );
}

