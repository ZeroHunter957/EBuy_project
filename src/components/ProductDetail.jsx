import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getProductById
} from "../api/productAPI";
import { addItem } from "../api/cartAPI";
import { toAbsoluteApiUrl } from "../api/config";
import { toast } from "react-toastify";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [selectedImageId, setSelectedImageId] = useState(null);

    useEffect(() => {
        setLoading(true);
        getProductById(id)
            .then((res) => {
                const p = res.data;
                setProduct(p);
                const primary = p?.images?.find((i) => i.primary) || p?.images?.[0];
                setSelectedImageId(primary?.id ?? null);
            })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [id]);

    const getSelectedImage = (p) => {
        if (!p?.images?.length) return null;
        return p.images.find((i) => i.id === selectedImageId)
            || p.images.find((i) => i.primary)
            || p.images[0];
    };

    const getImageUrl = (img) => {
        if (!img?.imageUrl) return "";
        return toAbsoluteApiUrl(img.imageUrl);
    };

    const handleAddToCart = async () => {
        if (!user) {
            toast.warn("Please login to add to cart");
            navigate("/login");
            return;
        }

        const stock = Number(product?.stock ?? 0);
        const quantity = Number(qty || 1);
        if (quantity <= 0) {
            toast.warn("Quantity must be at least 1");
            return;
        }
        if (stock > 0 && quantity > stock) {
            toast.warn(`Only ${stock} item(s) left in stock`);
            return;
        }

        try {
            await addItem(Number(id), quantity);
            toast.success("Added to cart");
        } catch (err) {
            const message = err?.response?.data?.message;
            if (message && message.toLowerCase().includes("insufficient stock")) {
                toast.warn(`Not enough stock. Only ${stock} item(s) available`);
                return;
            }
            toast.error(message || "Add to cart failed");
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

    if (!product) {
        return (
            <div style={{ padding: 20 }} className="text-muted">
                Product not found.
            </div>
        );
    }

    const img = getSelectedImage(product);
    const canAdd =
        product.available !== false && Number(product.stock ?? 0) > 0;

    return (
        <div style={{ padding: 20 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>{product.name}</h2>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/shop")}
                >
                    Back to shop
                </button>
            </div>

            <div className="card p-3">
                <div className="d-flex gap-3 flex-wrap">
                    <div style={{ minWidth: 240 }}>
                        {img && (
                            <img
                                src={getImageUrl(img)}
                                alt={product.name}
                                style={{
                                    width: "100%",
                                    maxWidth: 320,
                                    height: 240,
                                    objectFit: "contain",
                                    background: "#f7f7f7"
                                }}
                            />
                        )}

                        {(product.images || []).length > 1 && (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {(product.images || []).map((im) => {
                                    const active = im.id === img?.id;
                                    return (
                                        <button
                                            key={im.id}
                                            type="button"
                                            className={`btn p-0 border ${active ? "border-primary border-2" : ""}`}
                                            style={{
                                                width: 64,
                                                height: 64,
                                                overflow: "hidden",
                                                background: "#fff"
                                            }}
                                            onClick={() => setSelectedImageId(im.id)}
                                            title={active ? "Selected" : "View"}
                                        >
                                            <img
                                                src={getImageUrl(im)}
                                                alt=""
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    display: "block"
                                                }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div className="mb-2">
                            <span className="badge bg-secondary me-2">
                                {product.status}
                            </span>
                            {product.available ? (
                                <span className="badge bg-success">Enabled</span>
                            ) : (
                                <span className="badge bg-danger">Disabled</span>
                            )}
                        </div>

                        <div className="fs-4 text-danger mb-2">
                            ${product.price}
                        </div>
                        <div className="text-muted mb-3">
                            Stock: {product.stock}
                        </div>

                        <div className="mb-3">
                            {product.categories?.length
                                ? product.categories
                                      .map((c) => c.name)
                                      .join(", ")
                                : null}
                        </div>

                        <div className="mb-3">
                            {product.description || "—"}
                        </div>

                        <div className="d-flex gap-2 flex-wrap">
                            <input
                                className="form-control"
                                style={{ width: 120 }}
                                type="number"
                                min="1"
                                step="1"
                                max={Number(product.stock ?? 0) > 0 ? Number(product.stock ?? 0) : undefined}
                                value={qty}
                                onChange={(e) => setQty(Number(e.target.value))}
                                disabled={!canAdd}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleAddToCart}
                                disabled={!canAdd}
                            >
                                {canAdd
                                    ? "Add to cart"
                                    : !product.available
                                      ? "Disabled"
                                      : "Out of stock"}
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate(`/reviews/${product.id}`)}
                            >
                                View reviews
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

