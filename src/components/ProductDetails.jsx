import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getProductsByCategory } from "../api/productAPI";
import { addItem } from "../api/cartAPI";
import { addReview, getReviewsByProduct } from "../api/reviewAPI";
import { toAbsoluteApiUrl } from "../api/config";
import { toast } from "react-toastify";

export default function ProductDetails() {
    const carouselRef = useRef();
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [product, setProduct] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewTab, setReviewTab] = useState("LIST");
    const [hover, setHover] = useState(0);
    const [qty, setQty] = useState(1);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [zoomed, setZoomed] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const loadProduct = useCallback(async () => {
        const res = await getProductById(id);
        const p = res.data;

        setProduct(p);
        const primary = p?.images?.find((i) => i.primary) || p?.images?.[0];
        setSelectedImageId(primary?.id ?? null);

        if (p.categories?.length > 0) {
            const catId = p.categories[0].id;
            const sim = await getProductsByCategory(catId, 0, 10);
            const list = sim.data.content || sim.data || [];
            setSimilar(list.filter((x) => x.id !== p.id));
        } else {
            setSimilar([]);
        }
    }, [id]);

    const loadReviews = useCallback(async () => {
        setReviewsLoading(true);
        try {
            const res = await getReviewsByProduct(id);
            const list = Array.isArray(res.data) ? res.data : [];
            setReviews(list);
        } catch {
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadProduct();
        loadReviews();
    }, [loadProduct, loadReviews]);

    const getImageUrl = (img) => {
        if (!img?.imageUrl) return "";
        return toAbsoluteApiUrl(img.imageUrl);
    };

    const getSelected = () => {
        if (!product?.images?.length) return null;
        return (
            product.images.find((i) => i.id === selectedImageId) ||
            product.images.find((i) => i.primary) ||
            product.images[0]
        );
    };

    const addToCart = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        const stock = Number(product.stock ?? 0);
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
            await addItem(product.id, quantity);
            toast.success("Added");
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            const message = err?.response?.data?.message;
            if (message && message.toLowerCase().includes("insufficient stock")) {
                toast.warn(`Not enough stock. Only ${stock} item(s) available`);
                return;
            }
            toast.error(message || "Add to cart failed");
        }
    };

    const submitReview = async () => {
        setReviewError("");
        if (!user || user.role?.name !== "USER") {
            navigate("/login");
            return;
        }

        if (rating < 1 || rating > 5) {
            setReviewError("Rating must be from 1 to 5");
            return;
        }
        if (comment && comment.trim().length > 0 && comment.trim().length < 3) {
            setReviewError("Review must be at least 3 characters");
            return;
        }

        try {
            setReviewSubmitting(true);
            await addReview({
                rating,
                comment: comment?.trim() || null,
                product: { id: product.id }
            });
            setComment("");
            setRating(5);
            setHover(0);
            setReviewTab("LIST");
            await loadReviews();
            toast.success("Review saved");
        } catch (err) {
            setReviewError(err?.response?.data?.message || "Cannot submit review");
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (!product) return <div>Loading...</div>;

    const img = getSelected();
    const averageRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
        : "0.0";
    const canAddToCart = product.available !== false && Number(product.stock ?? 0) > 0;

    const StarInput = () => (
        <div className="stars starInput">
            {[1, 2, 3, 4, 5].map((n) => (
                <span
                    key={n}
                    className={n <= (hover || rating) ? "star active" : "star"}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                >
                    ★
                </span>
            ))}
        </div>
    );

    const Stars = ({ value }) => (
        <span className="stars">
            {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= value ? "star active" : "star"}>
                    ★
                </span>
            ))}
        </span>
    );

    return (
        <div className="details">
            <div className="container">
                <div className="productLayout">
                    <div className="leftCol">
                        {img && (
                            <div
                                className="imageWrapper"
                                onMouseEnter={() => setZoomed(true)}
                                onMouseLeave={() => setZoomed(false)}
                                onClick={() => setShowModal(true)}
                            >
                                <img src={getImageUrl(img)} alt={product.name} className={`mainImage ${zoomed ? "zoomed" : ""}`} />
                            </div>
                        )}

                        <div className="thumbRow">
                            {(product.images || []).map((im) => (
                                <img
                                    key={im.id}
                                    src={getImageUrl(im)}
                                    alt={product.name}
                                    className={im.id === selectedImageId ? "thumb active" : "thumb"}
                                    onClick={() => setSelectedImageId(im.id)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="middleCol">
                        <h1 className="title">{product.name}</h1>

                        <div className="ratingRow">
                            ★ {averageRating}
                            <span className="reviewCount">({reviews.length} ratings)</span>
                        </div>

                        <div className="price">${product.price}</div>
                        <div className="divider"></div>
                        <p className="description">{product.description}</p>
                    </div>

                    <div className="rightCol">
                        <div className="buyBox">
                            <div className="price big">${product.price}</div>
                            <div className={`stock ${product.stock > 0 ? "in" : "out"}`}>
                                {product.stock > 0 ? "In Stock" : "Out of Stock"}
                            </div>

                            <div className="qtyRow">
                                <label>Qty:</label>
                                <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                            </div>

                            <button className="buyBtn" onClick={addToCart} disabled={!canAddToCart}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>

                <div className="reviewSection">
                    <h2>Customer Reviews</h2>

                    <div className="reviewTabs">
                        <button className={reviewTab === "LIST" ? "active" : ""} onClick={() => setReviewTab("LIST")}>
                            Reviews
                        </button>
                        <button className={reviewTab === "ADD" ? "active" : ""} onClick={() => setReviewTab("ADD")}>
                            Write Review
                        </button>
                    </div>

                    {reviewTab === "LIST" && (
                        <div className="reviewList">
                            {reviewsLoading && <p>Loading...</p>}
                            {!reviewsLoading && reviews.length === 0 && <p>No reviews yet</p>}
                            {reviews.map((r) => (
                                <div key={r.id} className="reviewCard">
                                    <div className="reviewTop">
                                        <strong>{r.user?.username || "User"}</strong>
                                        <Stars value={r.rating} />
                                    </div>
                                    {r.comment && <p className="comment">{r.comment}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {reviewTab === "ADD" && user?.role?.name === "USER" && (
                        <div className="reviewBox">
                            <StarInput />

                            <textarea
                                placeholder="Write your thoughts (optional)..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />

                            <button onClick={submitReview} disabled={reviewSubmitting}>
                                {reviewSubmitting ? "Submitting..." : "Submit Review"}
                            </button>

                            {reviewError && <p className="error">{reviewError}</p>}
                        </div>
                    )}
                </div>
            </div>

            <div className="similarSection">
                <h2>Similar Products</h2>

                <div className="carouselWrapper">
                    <button
                        className="arrow left"
                        onClick={() => carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
                        aria-label="Scroll similar products left"
                    >
                        ‹
                    </button>

                    <div className="carousel" ref={carouselRef}>
                        {similar.map((p) => {
                            const similarImg = p.images?.find((i) => i.primary) || p.images?.[0];

                            return (
                                <div key={p.id} className="carouselCard" onClick={() => navigate(`/product/${p.id}`)}>
                                    {similarImg && <img src={getImageUrl(similarImg)} alt={p.name} />}
                                    <div className="name">{p.name}</div>
                                    <div className="price">${p.price}</div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        className="arrow right"
                        onClick={() => carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
                        aria-label="Scroll similar products right"
                    >
                        ›
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="imageModal" onClick={() => setShowModal(false)}>
                    <img src={getImageUrl(img)} alt={product.name} />
                </div>
            )}

            <style>{`
.details { background:#f5f6f8; min-height:100vh; }
.container { max-width:1200px; margin:auto; padding:30px; }
.productCard { display:flex; gap:40px; background:white; padding:25px; border-radius:16px; box-shadow:0 4px 15px rgba(0,0,0,0.1); }
.productLayout { display: grid; grid-template-columns: 1fr 1.5fr 320px; gap: 30px; align-items: start; }
.leftCol { background: white; padding: 15px; border-radius: 12px; }
.mainImage { width: 100%; height: 350px; object-fit: contain; }
.thumbRow { display: flex; gap: 8px; margin-top: 10px; }
.thumb { width: 55px; height: 55px; border-radius: 6px; object-fit: cover; cursor: pointer; border: 2px solid transparent; }
.thumb.active { border-color: #ff9900; }
.middleCol { background: white; padding: 20px; border-radius: 12px; }
.title { font-size: 24px; font-weight: 600; }
.ratingRow { color: #ff9900; margin: 8px 0; }
.reviewCount { color: #555; margin-left: 8px; }
.price { font-size: 22px; color: #b12704; font-weight: bold; }
.divider { height: 1px; background: #eee; margin: 15px 0; }
.description { color: #444; line-height: 1.5; }
.rightCol { position: sticky; top: 20px; }
.buyBox { background: white; padding: 20px; border-radius: 12px; border: 1px solid #ddd; }
.price.big { font-size: 24px; margin-bottom: 10px; }
.stock.in { color: green; margin-bottom: 10px; }
.stock.out { color: red; margin-bottom: 10px; }
.qtyRow { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.qtyRow input { width: 70px; padding: 5px; }
.buyBtn { width: 100%; padding: 12px; border: none; background: #ffd814; border-radius: 8px; font-weight: bold; cursor: pointer; }
.buyBtn:hover { background: #f7ca00; }
@media (max-width: 900px) { .productLayout { grid-template-columns: 1fr; } .rightCol { position: static; } }
.imageSection { flex:1; }
.imageWrapper { overflow: hidden; border-radius: 12px; cursor: zoom-in; }
.mainImage { width: 100%; height: 350px; object-fit: contain; transition: transform 0.3s ease; }
.mainImage.zoomed { transform: scale(1.5); }
.thumbs { display:flex; gap:10px; margin-top:10px; }
.thumb { width:60px; height:60px; object-fit:cover; border-radius:8px; cursor:pointer; border:2px solid transparent; }
.thumb.active { border-color:#007bff; }
.imageModal { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:1000; cursor: zoom-out; }
.imageModal img { max-width:90%; max-height:90%; border-radius:10px; }
.infoSection { flex:1; display:flex; flex-direction:column; }
.title { font-size:26px; font-weight:bold; }
.ratingLine { color:#ff9900; margin:5px 0; }
.price { font-size:24px; color:#b12704; font-weight:bold; margin:10px 0; }
.badges { display:flex; gap:10px; margin-bottom:10px; }
.stock, .status { background:#eee; padding:5px 10px; border-radius:6px; font-size:13px; }
.description { margin:10px 0; color:#444; }
.cartBox { margin-top:auto; padding:15px; border:1px solid #eee; border-radius:10px; }
.qtyRow { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.qtyRow input { width:80px; padding:6px; }
.addCartBtn { width:100%; padding:12px; border:none; background:#ffd814; font-weight:bold; border-radius:10px; cursor:pointer; }
.addCartBtn:hover { background:#f7ca00; }
.reviewSection { margin-top:30px; background:white; padding:20px; border-radius:16px; box-shadow:0 4px 15px rgba(0,0,0,0.08); }
.reviewTabs { display:flex; gap:10px; margin-bottom:15px; }
.reviewTabs button { padding:8px 14px; border:none; background:#eee; border-radius:8px; cursor:pointer; }
.reviewTabs .active { background:#007bff; color:white; }
.reviewCard { padding: 12px; border-bottom: 1px solid #eee; }
.reviewTop { display: flex; justify-content: space-between; align-items: center; }
.reviewCard strong { font-size: 14px; }
.comment { margin-top: 6px; font-size: 14px; }
.reviewBox textarea { width:100%; height:90px; margin-top:10px; padding:10px; border-radius:8px; border:1px solid #ccc; }
.reviewBox button { margin-top:10px; padding:10px 15px; border:none; background:#007bff; color:white; border-radius:8px; }
.error { color:red; margin-top:5px; }
.stars { font-size:32px; color:#ccc; cursor:pointer; display:flex; gap:6px; }
.star { transition: transform 0.15s, color 0.15s, text-shadow 0.15s; padding:4px; }
.star:hover { transform: scale(1.3); }
.star.active { color:#ffb400; text-shadow: 0 0 6px rgba(255,180,0,0.8); }
.similarSection { margin-top:40px; padding:20px; background:white; border-radius:16px; box-shadow:0 4px 15px rgba(0,0,0,0.08); }
.carouselWrapper { position:relative; display:flex; align-items:center; }
.carousel { display:flex; gap:15px; overflow-x:auto; scroll-behavior:smooth; padding:10px; }
.carousel::-webkit-scrollbar { display:none; }
.carouselCard { min-width:180px; max-width:180px; background:#fff; border-radius:12px; padding:10px; cursor:pointer; transition:0.2s; border:1px solid #eee; }
.carouselCard:hover { transform: translateY(-5px); box-shadow:0 6px 20px rgba(0,0,0,0.1); }
.carouselCard img { width:100%; height:140px; object-fit:contain; }
.carouselCard .name { font-size:14px; margin-top:5px; height:40px; overflow:hidden; }
.carouselCard .price { color:#b12704; font-weight:bold; }
.arrow { position:absolute; z-index:10; background:white; border:none; width:35px; height:60px; cursor:pointer; font-size:24px; box-shadow:0 2px 8px rgba(0,0,0,0.2); }
.arrow.left { left:0; }
.arrow.right { right:0; }
.carouselCard { min-width: 180px; max-width: 180px; background: white; border-radius: 12px; padding: 12px; cursor: pointer; box-shadow: 0 3px 10px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; flex-shrink: 0; }
.carouselCard:hover { transform: translateY(-5px); box-shadow: 0 6px 18px rgba(0,0,0,0.15); }
.carouselCard img { width: 100%; height: 140px; object-fit: contain; margin-bottom: 8px; }
.cardName { font-size: 14px; font-weight: 500; height: 40px; overflow: hidden; }
.cardPrice { color: #b12704; font-weight: bold; margin-top: 5px; }
.navBtn { position: absolute; top: 50%; transform: translateY(-50%); background: white; border: none; font-size: 24px; width: 36px; height: 36px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer; z-index: 2; }
.navBtn.left { left: 5px; }
.navBtn.right { right: 5px; }
.navBtn:hover { background: #f0f0f0; }
`}</style>
        </div>
    );
}
