import React, { useCallback, useEffect, useRef, useState } from "react";
import { getAllCategories } from "../api/categoryAPI";
import { getNewProducts, getProductsByCategory } from "../api/productAPI";
import { useNavigate } from "react-router-dom";
import { addItem } from "../api/cartAPI";
import { toAbsoluteApiUrl } from "../api/config";
import { toast } from "react-toastify";

export default function Home() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const user = JSON.parse(localStorage.getItem("user"));
    const [newProducts, setNewProducts] = useState([]);
    const rowRefs = useRef({});

    const loadProducts = useCallback(async (categoryId) => {
        try {
            const res = await getProductsByCategory(categoryId, 0, 10);
            const data = res.data;
            const list = Array.isArray(data) ? data : data.content || [];

            setProductsByCategory((prev) => ({
                ...prev,
                [categoryId]: list
            }));
        } catch {
            setProductsByCategory((prev) => ({
                ...prev,
                [categoryId]: []
            }));
        }
    }, []);

    const loadCategories = useCallback(async () => {
        const res = await getAllCategories();
        setCategories(res.data);
        res.data.forEach((c) => loadProducts(c.id));
    }, [loadProducts]);

    const loadNewProducts = useCallback(async () => {
        try {
            const res = await getNewProducts(0, 10);
            const data = res.data;
            const list = Array.isArray(data) ? data : data.content || [];
            setNewProducts(list);
        } catch {
            setNewProducts([]);
        }
    }, []);

    useEffect(() => {
        loadCategories();
        loadNewProducts();
    }, [loadCategories, loadNewProducts]);

    const handleAddToCart = async (productId, e) => {
        e.stopPropagation();

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

    const getPrimaryImage = (product) => {
        if (!product.images) return null;
        return product.images.find((i) => i.primary) || product.images[0];
    };

    const getImageUrl = (img) => {
        if (!img?.imageUrl) return "";
        return toAbsoluteApiUrl(img.imageUrl);
    };

    const getAverageRating = (product) => {
        if (!product.reviews || product.reviews.length === 0) return 0;

        const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        return (total / product.reviews.length).toFixed(1);
    };

    const isNewProduct = (product) => {
        if (!product.createdAt) return false;

        const created = new Date(product.createdAt);
        const now = new Date();
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);

        return diffDays <= 7;
    };

    const scrollRow = (categoryId, direction) => {
        const row = rowRefs.current[categoryId];
        if (!row) return;

        const card = row.querySelector(".card");
        if (!card) return;

        const cardWidth = card.offsetWidth + 20;
        const scrollAmount = cardWidth * 2;

        row.scrollBy({
            left: direction * scrollAmount,
            behavior: "smooth"
        });
    };

    return (
        <div className="home">
            <div className="hero">
                <h1>EBuy</h1>
                <p>Best deals everyday</p>
            </div>

            <div className="categoryGrid">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="categoryCard"
                        onClick={() => navigate(`/shop?categoryId=${cat.id}`)}
                    >
                        {cat.name}
                    </div>
                ))}
            </div>

            <div className="container">
                <div className="sectionHeader">
                    <h2 style={{ cursor: "pointer" }} onClick={() => navigate("/shop?new=true")}>
                        New Products
                    </h2>
                </div>

                <div className="carouselWrapper">
                    <button className="arrow left" onClick={() => scrollRow("new", -1)} aria-label="Scroll new products left">
                        ‹
                    </button>

                    <div className="viewport">
                        <div className="row" ref={(el) => (rowRefs.current.new = el)}>
                            {newProducts.map((p) => {
                                const img = getPrimaryImage(p);

                                return (
                                    <div
                                        key={p.id}
                                        className="card"
                                        onClick={() => navigate(`/product/${p.id}`)}
                                    >
                                        {img && <img src={getImageUrl(img)} alt={p.name} />}

                                        <div className="cardName">{p.name}</div>
                                        <div className="cardPrice">${p.price}</div>

                                        {isNewProduct(p) && <div className="newBadge">NEW</div>}

                                        <button className="addBtn" onClick={(e) => handleAddToCart(p.id, e)}>
                                            Add to cart
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button className="arrow right" onClick={() => scrollRow("new", 1)} aria-label="Scroll new products right">
                        ›
                    </button>
                </div>
            </div>

            <div className="container">
                <div className="sectionHeader">
                    <h2>Best Sellers</h2>
                </div>
            </div>

            <div className="container">
                {categories.map((category) => (
                    <div key={category.id} className="section">
                        <div className="sectionHeader">
                            <h2 style={{ cursor: "pointer" }} onClick={() => navigate(`/shop?categoryId=${category.id}`)}>
                                {category.name}
                            </h2>
                        </div>

                        <div className="carouselWrapper">
                            <button
                                className="arrow left"
                                onClick={() => scrollRow(category.id, -1)}
                                aria-label={`Scroll ${category.name} products left`}
                            >
                                ‹
                            </button>

                            <div className="viewport">
                                <div className="row" ref={(el) => (rowRefs.current[category.id] = el)}>
                                    {(productsByCategory[category.id] || []).map((p) => {
                                        const img = getPrimaryImage(p);

                                        return (
                                            <div
                                                key={p.id}
                                                className="card"
                                                onClick={() => navigate(`/product/${p.id}`)}
                                            >
                                                {img && <img src={getImageUrl(img)} alt={p.name} />}

                                                <div className="cardName">{p.name}</div>
                                                <div className="cardPrice">${p.price}</div>

                                                <div className="rating">
                                                    ★ {getAverageRating(p)} ({p.reviews?.length || 0})
                                                </div>

                                                <button className="addBtn" onClick={(e) => handleAddToCart(p.id, e)}>
                                                    Add to cart
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                className="arrow right"
                                onClick={() => scrollRow(category.id, 1)}
                                aria-label={`Scroll ${category.name} products right`}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
.home {
    background:#eaeded;
    min-height:100vh;
}
.hero {
    height:260px;
    background: linear-gradient(135deg, #ff7e5f, #feb47b, #86a8e7, #91eac9);
    background-size: 300% 300%;
    animation: gradientMove 8s ease infinite;
    color:white;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    text-shadow:0 2px 6px rgba(0,0,0,0.4);
}
@keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
.hero h1 { font-size:48px; font-weight:800; }
.hero p { font-size:18px; opacity:0.9; }
.categoryGrid {
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap:15px;
    padding:20px 60px;
    margin-top:-40px;
    z-index:5;
    position:relative;
}
.categoryCard {
    padding:20px;
    border-radius:14px;
    color:white;
    font-weight:bold;
    text-align:center;
    cursor:pointer;
    box-shadow:0 6px 16px rgba(0,0,0,0.3);
    transition:0.25s;
}
.categoryCard:nth-child(1) { background:#ff6b6b; }
.categoryCard:nth-child(2) { background:#4ecdc4; }
.categoryCard:nth-child(3) { background:#f7b733; }
.categoryCard:nth-child(4) { background:#5f27cd; }
.categoryCard:nth-child(5) { background:#10ac84; }
.categoryCard:nth-child(6) { background:#ff9f43; }
.categoryCard:hover {
    transform:translateY(-6px) scale(1.05);
    box-shadow:0 10px 24px rgba(0,0,0,0.4);
}
.container {
    width:100%;
    max-width:1800px;
    margin:auto;
    padding:20px 60px;
}
.section { margin-bottom:50px; }
.sectionHeader { margin-bottom:15px; }
.sectionHeader h2 {
    font-size:22px;
    font-weight:700;
    position:relative;
}
.sectionHeader h2::after {
    content:"";
    width:50px;
    height:3px;
    background:#ff9900;
    position:absolute;
    bottom:-5px;
    left:0;
}
.row {
    padding: 10px 40px;
    display:flex;
    gap:20px;
    overflow-x:auto;
    scroll-behavior:smooth;
    flex-wrap:nowrap;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
}
.row::-webkit-scrollbar { display:none; }
.carouselWrapper {
    position:relative;
    overflow:visible;
}
.carouselWrapper::before,
.carouselWrapper::after {
    content:"";
    position:absolute;
    top:0;
    width:80px;
    height:100%;
    z-index:2;
    pointer-events:none;
}
.carouselWrapper::before {
    left:0;
    background:linear-gradient(to right, #eaeded 20%, transparent);
}
.carouselWrapper::after {
    right:0;
    background:linear-gradient(to left, #eaeded 20%, transparent);
}
.viewport {
    overflow-x: hidden;
    overflow-y: visible;
}
.arrow {
    position:absolute;
    top:50%;
    transform:translateY(-50%);
    background:white;
    border:none;
    font-size:28px;
    font-weight:bold;
    width:50px;
    height:80px;
    cursor:pointer;
    z-index:5;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
    border-radius:10px;
    opacity:0.9;
    display:flex;
    align-items:center;
    justify-content:center;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.arrow:hover {
    background:#ffd814;
    transform:translateY(-50%) scale(1.05);
    box-shadow:0 4px 12px rgba(0,0,0,0.4);
}
.arrow.left { left:-10px; }
.arrow.right { right:-10px; }
.card {
    width:200px;
    background:white;
    border-radius:14px;
    padding:12px;
    box-shadow:0 4px 12px rgba(0,0,0,0.15);
    transition:0.3s;
    cursor:pointer;
    display:flex;
    flex-direction:column;
    position:relative;
    flex:0 0 auto;
    scroll-snap-align: start;
}
.card:hover {
    transform:scale(1.1);
    box-shadow:0 10px 24px rgba(0,0,0,0.3);
    z-index:2;
}
.card img {
    width:100%;
    height:180px;
    object-fit:contain;
    background:#f7f7f7;
    border-radius:6px;
}
.cardName {
    font-weight:bold;
    margin-top:6px;
    font-size:14px;
    min-height:32px;
}
.cardPrice {
    color:#b12704;
    font-weight:bold;
    margin-top:4px;
}
.rating {
    font-size:13px;
    color:#f39c12;
    margin-top:4px;
}
.addBtn {
    margin-top:8px;
    padding:8px;
    border:none;
    border-radius:20px;
    background:#ffd814;
    cursor:pointer;
    font-weight:bold;
    transition:0.2s;
}
.addBtn:hover { background:#f7ca00; }
.newBadge {
    position:absolute;
    top:8px;
    left:8px;
    background:red;
    color:white;
    font-size:12px;
    font-weight:bold;
    padding:4px 8px;
    border-radius:6px;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
    z-index:3;
}
`}</style>
        </div>
    );
}
