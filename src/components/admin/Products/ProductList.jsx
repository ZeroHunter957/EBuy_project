import React, { useCallback, useEffect, useState } from "react";
import {
    getAllProducts,
    searchProducts,
    getProductsByCategory,
    updateProduct
} from "../../../api/productAPI";
import { getAllCategories } from "../../../api/categoryAPI";
import { useNavigate } from "react-router-dom";
import { toAbsoluteApiUrl } from "../../../api/config";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

export default function ProductList() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [categoryId, setCategoryId] = useState("all");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllCategories().then((res) => setCategories(res.data));
    }, []);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (searchName) {
                res = await searchProducts(searchName, page, PAGE_SIZE);
            } else if (categoryId !== "all" && categoryId !== "") {
                res = await getProductsByCategory(Number(categoryId), page, PAGE_SIZE);
            } else {
                res = await getAllProducts(page, PAGE_SIZE);
            }

            const data = res.data;
            setProducts(data.content || []);
            setTotalPages(data.totalPages ?? 0);
            setTotalElements(data.totalElements ?? 0);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [searchName, categoryId, page]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleSearch = (e) => {
        e?.preventDefault();
        setSearchName(searchInput.trim());
        setPage(0);
    };

    const handleCategoryChange = (e) => {
        setCategoryId(e.target.value);
        setPage(0);
    };

    const handleDisable = async (product) => {
        if (!window.confirm("Toggle product availability?")) return;

        try {
            await updateProduct(product.id, {
                ...product,
                available: !product.available
            });

            setSearchName("");
            setCategoryId("all");
            setPage(0);
        } catch {
            toast.error("Update failed");
        }
    };

    const getPrimaryImage = (product) => {
        if (!product.images?.length) return null;
        return product.images.find((i) => i.primary) || product.images[0];
    };

    const getImageUrl = (img) => {
        if (!img?.imageUrl) return "";
        return toAbsoluteApiUrl(img.imageUrl);
    };

    const statusBadge = (status) => {
        const s = status || "";
        let cls = "bg-secondary";
        if (s === "PENDING") cls = "bg-warning text-dark";
        if (s === "APPROVED") cls = "bg-success";
        if (s === "REJECTED") cls = "bg-danger";
        return <span className={`badge ${cls}`}>{s}</span>;
    };

    const availabilityBadge = (available) => {
        return available ? <span className="badge bg-success">Enabled</span> : <span className="badge bg-danger">Disabled</span>;
    };

    const renderFilters = () => (
        <div className="card p-3 mb-3">
            <form onSubmit={handleSearch} className="row g-2">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={categoryId} onChange={handleCategoryChange}>
                        <option value="all">All categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <button type="submit" className="btn btn-primary w-100">
                        Search
                    </button>
                </div>
            </form>
        </div>
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const start = Math.max(0, page - 2);
        const end = Math.min(totalPages - 1, page + 2);

        for (let i = start; i <= end; i++) pages.push(i);

        return (
            <nav className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted">
                    Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements}
                </span>
                <ul className="pagination mb-0">
                    <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                            Previous
                        </button>
                    </li>
                    {pages.map((p) => (
                        <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                            <button className="page-link" onClick={() => setPage(p)}>
                                {p + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${page >= totalPages - 1 ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Products</h2>
                <button className="btn btn-primary" onClick={() => navigate("/admin/products/add")}>
                    + Add Product
                </button>
            </div>

            {renderFilters()}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Availability</th>
                                <th>Price</th>
                                <th>Image</th>
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
                                        <td>{p.name}</td>
                                        <td>{statusBadge(p.status)}</td>
                                        <td>{availabilityBadge(p.available)}</td>
                                        <td>${p.price}</td>
                                        <td>
                                            {img ? (
                                                <img
                                                    src={getImageUrl(img)}
                                                    alt={p.name}
                                                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
                                                />
                                            ) : (
                                                <span className="text-muted">No image</span>
                                            )}
                                        </td>
                                        <td>{p.categories?.length ? p.categories.map((c) => c.name).join(", ") : "-"}</td>
                                        <td>{p.stock ?? 0}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-secondary me-1"
                                                onClick={() => navigate(`/admin/products/detail/${p.id}`)}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-1"
                                                onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                                            >
                                                Edit
                                            </button>
                                            <button className="btn btn-sm btn-outline-warning" onClick={() => handleDisable(p)}>
                                                {p.available ? "Disable" : "Enable"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {products.length === 0 && <div className="text-center text-muted py-4">No products found</div>}
                    {renderPagination()}
                </>
            )}
        </>
    );
}
