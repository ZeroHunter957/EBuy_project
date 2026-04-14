import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../../api/productAPI";
import { toAbsoluteApiUrl } from "../../../api/config";

export default function AdminProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);

    // ✅ NEW: fullscreen preview
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        setLoading(true);
        getProductById(id)
            .then((res) => setProduct(res.data))
            .catch(() => setError("Unable to load product"))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (product?.images?.length) {
            const primary = product.images.find((i) => i.primary) || product.images[0];
            setSelectedImage(primary);
        }
    }, [product]);

    const getImageUrl = (img) => {
        if (!img?.imageUrl) return "";
        return toAbsoluteApiUrl(img.imageUrl);
    };

    // ✅ Badge helpers
    const statusBadge = (status) => {
        let cls = "bg-secondary";
        if (status === "PENDING") cls = "bg-warning text-dark";
        if (status === "APPROVED") cls = "bg-success";
        if (status === "REJECTED") cls = "bg-danger";
        return <span className={`badge ${cls}`}>{status}</span>;
    };

    const availabilityBadge = (available) => {
        return available
            ? <span className="badge bg-success">Enabled</span>
            : <span className="badge bg-danger">Disabled</span>;
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-4">
                <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>
                    ← Return
                </button>
                <p className="text-danger">{error || "Product does not exist"}</p>
            </div>
        );
    }

    const images = product.images || [];

    return (
        <div className="container py-4">
            <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>
                ← Return
            </button>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Product #{product.id}</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                >
                    Edit product
                </button>
            </div>

            <div className="row g-4">
                {/* ✅ LEFT: IMAGES */}
                <div className="col-md-5">
                    <div className="card p-3">
                        {selectedImage ? (
                            <img
                                src={getImageUrl(selectedImage)}
                                alt={product.name}
                                className="img-fluid rounded mb-3"
                                style={{
                                    maxHeight: 350,
                                    objectFit: "cover",
                                    cursor: "pointer"
                                }}
                                onClick={() => setPreviewImage(getImageUrl(selectedImage))}
                            />
                        ) : (
                            <div className="bg-light d-flex align-items-center justify-content-center rounded mb-3" style={{ height: 250 }}>
                                <span className="text-muted">No image</span>
                            </div>
                        )}

                        {images.length > 1 && (
                            <div className="d-flex flex-wrap gap-2">
                                {images.map((img) => {
                                    const isActive = selectedImage && img.id === selectedImage.id;
                                    return (
                                        <img
                                            key={img.id}
                                            src={getImageUrl(img)}
                                            alt={product.name}
                                            className={`img-thumbnail ${isActive ? "border border-primary" : ""}`}
                                            style={{
                                                width: 70,
                                                height: 70,
                                                objectFit: "cover",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => setSelectedImage(img)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ RIGHT: INFO */}
                <div className="col-md-7">
                    <div className="card p-4 h-100">
                        <h3 className="mb-2">{product.name}</h3>

                        <div className="mb-3 d-flex gap-2">
                            {statusBadge(product.status)}
                            {availabilityBadge(product.available)}
                        </div>

                        <h4 className="text-danger mb-3">
                            ${Number(product.price).toFixed(2)}
                        </h4>

                        <p>
                            <strong>Stock:</strong> {product.stock ?? 0}
                        </p>

                        <p>
                            <strong>Category:</strong>{" "}
                            {product.categories?.length
                                ? product.categories.map((c) => c.name).join(", ")
                                : "-"}
                        </p>

                        <p>
                            <strong>Seller ID:</strong> {product.sellerId}
                        </p>

                        <p>
                            <strong>Created:</strong>{" "}
                            {product.createdAt
                                ? new Date(product.createdAt).toLocaleString()
                                : "-"}
                        </p>

                        <hr />

                        <p>
                            <strong>Description:</strong>
                        </p>
                        <p className="text-muted">
                            {product.description || "No description"}
                        </p>
                    </div>
                </div>
            </div>

            {/* ✅ FULLSCREEN IMAGE MODAL */}
            {previewImage && (
                <div
                    className="image-modal"
                    onClick={() => setPreviewImage(null)}
                >
                    <span
                        className="close-btn"
                        onClick={() => setPreviewImage(null)}
                    >
                        &times;
                    </span>

                    <img
                        src={previewImage}
                        alt="Preview"
                        className="modal-image"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <style>{`
                .image-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }

                .modal-image {
                    max-width: 90%;
                    max-height: 90%;
                    border-radius: 10px;
                }

                .close-btn {
                    position: absolute;
                    top: 20px;
                    right: 30px;
                    font-size: 40px;
                    color: white;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}