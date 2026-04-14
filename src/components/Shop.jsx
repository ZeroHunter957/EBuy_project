import React, { useCallback, useEffect, useState } from "react";
import { searchProducts } from "../api/productAPI";
import { getAllCategories } from "../api/categoryAPI";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addItem } from "../api/cartAPI";
import { toAbsoluteApiUrl } from "../api/config";
import { toast } from "react-toastify";

export default function Shop() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "all");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 12;
    const isNewFilter = searchParams.get("new") === "true";

    const loadCategories = useCallback(async () => {
        const res = await getAllCategories();
        setCategories(res.data);
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        const cat = searchParams.get("categoryId");
        setCategoryId(cat || "all");
        setPage(0);
    }, [searchParams]);

    const getAverageRating = (product) => {
        if (!product.reviews || product.reviews.length === 0) return 0;
        const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        return Number((total / product.reviews.length).toFixed(1));
    };

    const loadProducts = useCallback(async () => {
        setLoading(true);

        try {
            const res = await searchProducts(search, 0, 1000);
            let fullList = res.data.content || [];

            if (categoryId !== "all") {
                fullList = fullList.filter((p) =>
                    (p.categories || []).some((c) => Number(c.id) === Number(categoryId))
                );
            }

            if (minPrice !== "") {
                fullList = fullList.filter((p) => p.price >= Number(minPrice));
            }

            if (maxPrice !== "") {
                fullList = fullList.filter((p) => p.price <= Number(maxPrice));
            }

            if (isNewFilter) {
                const now = new Date();
                fullList = fullList.filter((p) => {
                    if (!p.createdAt) return false;
                    const created = new Date(p.createdAt);
                    return (now - created) / (1000 * 60 * 60 * 24) <= 7;
                });
            }

            switch (sortBy) {
                case "price_asc":
                    fullList.sort((a, b) => a.price - b.price);
                    break;
                case "price_desc":
                    fullList.sort((a, b) => b.price - a.price);
                    break;
                case "rating":
                    fullList.sort((a, b) => getAverageRating(b) - getAverageRating(a));
                    break;
                case "name":
                    fullList.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                default:
                    fullList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }

            const start = page * pageSize;
            const end = start + pageSize;
            const paginated = fullList.slice(start, end);

            setProducts(paginated);
            setTotalPages(Math.max(1, Math.ceil(fullList.length / pageSize)));
        } catch {
            setProducts([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [search, categoryId, minPrice, maxPrice, page, sortBy, isNewFilter]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const getPrimaryImage = (product) => {
        if (!product.images) return null;
        return product.images.find((i) => i.primary) || product.images[0];
    };

    const getImageUrl = (img) => {
        if (!img?.imageUrl) return "";
        return toAbsoluteApiUrl(img.imageUrl);
    };

    const handleAddToCart = async (productId) => {
        if (!user) {
            toast.warn("Please login to add to cart");
            navigate("/login");
            return;
        }

        try {
            const qtyStr = window.prompt("Quantity to add?", "1");
            const qty = Math.max(1, Number(qtyStr || 1));
            await addItem(productId, qty);
            toast.success("Added to cart");
            window.dispatchEvent(new Event("cart-updated"));
        } catch {
            toast.error("Add to cart failed");
        }
    };

    return (
        <div className="shop">
            <div className="container">
                <div className="topBar">
                    <div className="searchBox">
                        <input
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button onClick={loadProducts}>Search</button>
                    </div>

                    <div className="sortBox">
                        <label>Sort by:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(0);
                            }}
                        >
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                </div>

                <div className="content">
                    <div className="sidebar">
                        <div className="filterBlock">
                            <h4>Category</h4>
                            <select
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="all">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filterBlock">
                            <h4>Price Range</h4>
                            <div className="priceInputs">
                                <input
                                    type="number"
                                    placeholder="Min $"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                                <span className="dash">—</span>
                                <input
                                    type="number"
                                    placeholder="Max $"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>

                            <button className="applyBtn" onClick={() => setPage(0)}>
                                Apply
                            </button>
                        </div>
                    </div>

                    <div className="grid">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-5 text-muted">No products found.</div>
                        ) : (
                            products.map((p) => {
                                const img = getPrimaryImage(p);

                                return (
                                    <div
                                        key={p.id}
                                        className="card"
                                        onClick={() => navigate(`/product/${p.id}`)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        {img && <img src={getImageUrl(img)} alt={p.name} />}

                                        <div className="name">{p.name}</div>
                                        <div className="price">${p.price}</div>
                                        <div className="rating">★ {getAverageRating(p)} ({p.reviews?.length || 0})</div>

                                        <div className="mt-2 mb-2">
                                            {p.available ? (
                                                <span className="badge bg-success me-2">Enabled</span>
                                            ) : (
                                                <span className="badge bg-danger me-2">Disabled</span>
                                            )}
                                            <span className="badge bg-secondary">Stock: {p.stock ?? 0}</span>
                                        </div>

                                        {(() => {
                                            const canAdd = p.available !== false && Number(p.stock ?? 0) > 0;
                                            return (
                                                <button
                                                    className="btn btn-sm btn-primary mt-2"
                                                    disabled={!canAdd}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!canAdd) return;
                                                        handleAddToCart(p.id);
                                                    }}
                                                >
                                                    {canAdd ? "Add to cart" : !p.available ? "Disabled" : "Out of stock"}
                                                </button>
                                            );
                                        })()}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="pagination">
                    <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                        Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} className={page === i ? "active" : ""} onClick={() => setPage(i)}>
                            {i + 1}
                        </button>
                    ))}

                    <button disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                        Next
                    </button>
                </div>
            </div>

            <style>{`
.shop {
    background:#eaeded;
    min-height:100vh;
}
.container {
    width:100%;
    max-width:1500px;
    margin:auto;
    padding:20px 30px;
}
.topBar {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:20px;
    margin-bottom:20px;
    background:white;
    padding:15px;
    border-radius:12px;
    box-shadow:0 2px 8px rgba(0,0,0,0.08);
}
.topBar input {
    flex:1;
    padding:12px;
    border-radius:8px;
    border:1px solid #ddd;
    font-size:14px;
}
.topBar button {
    padding:10px 20px;
    border:none;
    border-radius:8px;
    background:#febd69;
    font-weight:bold;
}
.topBar button:hover { background:#f3a847; }
.searchBox { display:flex; flex:1; gap:10px; }
.searchBox input {
    flex:1;
    padding:12px;
    border-radius:8px;
    border:1px solid #ddd;
}
.searchBox button {
    background:#febd69;
    border:none;
    padding:10px 16px;
    border-radius:8px;
    font-weight:bold;
}
.sortBox { display:flex; align-items:center; gap:10px; }
.sortBox select {
    padding:8px;
    border-radius:8px;
    border:1px solid #ccc;
}
.content { display:flex; gap:20px; }
.sidebar {
    width:260px;
    background:white;
    padding:20px;
    border-radius:14px;
    box-shadow:0 4px 12px rgba(0,0,0,0.08);
    display:flex;
    flex-direction:column;
    gap:20px;
}
.filterBlock {
    border-bottom:1px solid #eee;
    padding-bottom:15px;
}
.filterBlock:last-child { border-bottom:none; }
.filterBlock h4 {
    font-size:15px;
    font-weight:700;
    margin-bottom:10px;
    color:#111;
}
.sidebar select {
    width:100%;
    padding:10px;
    border-radius:10px;
    border:1px solid #ddd;
    background:#fafafa;
    cursor:pointer;
    transition:0.2s;
}
.sidebar select:hover { border-color:#007bff; }
.priceInputs {
    display:flex;
    align-items:center;
    gap:8px;
}
.priceInputs input {
    flex:1;
    min-width:0;
    padding:10px;
    border-radius:10px;
    border:1px solid #ddd;
    background:#fafafa;
    transition:0.2s;
    box-sizing:border-box;
}
.priceInputs input:focus {
    outline:none;
    border-color:#007bff;
    background:white;
}
.dash { font-weight:bold; color:#666; }
.applyBtn {
    margin-top:10px;
    width:100%;
    padding:10px;
    border:none;
    border-radius:10px;
    background:#ffd814;
    font-weight:600;
    cursor:pointer;
    transition:0.2s;
}
.applyBtn:hover { background:#f7ca00; }
.grid {
    flex:1;
    display:grid;
    grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
    gap:24px;
}
.card {
    background:white;
    padding:12px;
    border-radius:14px;
    border:1px solid #eee;
    transition:0.25s;
    display:flex;
    flex-direction:column;
}
.card:hover {
    transform: translateY(-5px);
    box-shadow:0 10px 25px rgba(0,0,0,0.15);
}
.card img {
    width:100%;
    height:180px;
    object-fit:contain;
    background:#f7f7f7;
    border-radius:8px;
    transition: transform 0.3s ease;
}
.card:hover img { transform: scale(1.05); }
.name { font-size:14px; font-weight:600; margin-top:6px; }
.price { color:#b12704; font-size:18px; font-weight:bold; }
.rating { font-size:13px; color:#f39c12; }
.pagination {
    display:flex;
    justify-content:center;
    gap:8px;
    margin-top:20px;
}
.pagination button {
    padding:8px 12px;
    border:none;
    background:#eee;
    border-radius:6px;
    cursor:pointer;
}
.pagination button.active {
    background:#007bff;
    color:white;
}
.pagination button:disabled {
    opacity:0.5;
    cursor:not-allowed;
}
.badge {
    font-size:11px;
    padding:4px 8px;
    border-radius:6px;
}
`}</style>
        </div>
    );
}
