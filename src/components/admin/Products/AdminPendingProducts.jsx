import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAdminPendingProducts,
    approveProduct,
    rejectProduct
} from "../../../api/productAPI";

import { toAbsoluteApiUrl } from "../../../api/config";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

export default function AdminPendingProducts() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [previewImage, setPreviewImage] = useState(null);

    const load = async () => {
        try {
            setLoading(true);
            const res = await getAdminPendingProducts(0, PAGE_SIZE);
            const data = res.data;
            setProducts(data.content || []);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleApprove = async (id) => {
        try {
            await approveProduct(id);
            toast.success("Product approved");
            await load();
        } catch {
            toast.error("Approve failed");
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectProduct(id);
            toast.success("Product rejected");
            await load();
        } catch {
            toast.error("Reject failed");
        }
    };

    // ✅ Helpers (same pattern as ProductList)
    const getPrimaryImage = (product) => {
        if (!product.images?.length) return null;
        return product.images.find((i) => i.primary) || product.images[0];
    };

    const getImageUrl = (img) => {
        if (!img?.imageUrl) return "";
        return toAbsoluteApiUrl(img.imageUrl);
    };

    const statusBadge = () => (
        <span className="badge bg-warning text-dark">PENDING</span>
    );

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Pending Products</h2>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/admin/products")}
                >
                    Back to All Products
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                </div>
            ) : (
                <table className="table table-hover align-middle">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((p) => {
                        const img = getPrimaryImage(p);

                        return (
                            <tr key={p.id}>
                                <td>{p.id}</td>

                                {/* ✅ Image with hover zoom */}
                                <td>
                                    {img ? (
                                        <div className="position-relative">
                                            <img
                                                src={getImageUrl(img)}
                                                alt={p.name}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    objectFit: "cover",
                                                    borderRadius: 6,
                                                    cursor: "pointer"
                                                }}
                                                onClick={() => setPreviewImage(getImageUrl(img))}
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-muted">No image</span>
                                    )}
                                </td>

                                <td>{p.name}</td>
                                <td>{statusBadge()}</td>
                                <td>${p.price}</td>

                                {/* ✅ Categories */}
                                <td>
                                    {p.categories?.length
                                        ? p.categories.map((c) => c.name).join(", ")
                                        : "-"}
                                </td>

                                <td>{p.stock ?? 0}</td>

                                <td>
                                    <button
                                        className="btn btn-sm btn-success me-2"
                                        onClick={() => handleApprove(p.id)}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger me-2"
                                        onClick={() => handleReject(p.id)}
                                    >
                                        Reject
                                    </button>

                                    {/* Optional: go to detail page */}
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() =>
                                            navigate(`/admin/products/detail/${p.id}`)
                                        }
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}

            {!loading && products.length === 0 && (
                <div className="text-center text-muted py-4">
                    No pending products.
                </div>
            )}

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
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
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
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-image {
    max-width: 90%;
    max-height: 90%;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
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