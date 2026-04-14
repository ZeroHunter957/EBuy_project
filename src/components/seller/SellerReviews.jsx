import React, { useEffect, useState } from "react";

import { getReviewsBySeller } from "../../api/reviewAPI";
import SellerLayout from "./SellerLayout";

const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} style={{ color: i <= rating ? "#f59e0b" : "#d1d5db", fontSize: 18 }}>
                ★
            </span>
        );
    }
    return <span>{stars}</span>;
};

export default function SellerReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState("all");

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await getReviewsBySeller();
                if (!mounted) return;
                setReviews(res.data || []);
            } catch {
                if (!mounted) return;
                setReviews([]);
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };
        load();

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + Number(r.rating ?? 0), 0) / reviews.length).toFixed(1)
        : "0.0";

    const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => Number(r.rating ?? 0) === star).length,
    }));

    const filtered = filterRating === "all"
        ? reviews
        : reviews.filter((r) => Number(r.rating ?? 0) === Number(filterRating));

    return (
        <SellerLayout>
            <div>
                <h2 className="mb-4">Your Products' reviews</h2>

                {reviews.length === 0 ? (
                    <div className="text-muted">
                        You don't have any reviews yet
                    </div>
                ) : (
                    <>
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <div className="card p-3 text-center shadow-sm border-0" style={{ background: "#fffbeb" }}>
                                    <div style={{ fontSize: 36, fontWeight: 700, color: "#f59e0b" }}>{avgRating}</div>
                                    <StarRating rating={Math.round(Number(avgRating))} />
                                    <div className="text-muted mt-1">{reviews.length} Reviews</div>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="card p-3 shadow-sm border-0">
                                    {ratingCounts.map(({ star, count }) => {
                                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                        return (
                                            <div key={star} className="d-flex align-items-center gap-2 mb-1">
                                                <span style={{ width: 30, textAlign: "right", fontSize: 13 }}>{star} ★</span>
                                                <div style={{ flex: 1, height: 10, background: "#e5e7eb", borderRadius: 5, overflow: "hidden" }}>
                                                    <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: 5, transition: "0.3s" }} />
                                                </div>
                                                <span style={{ width: 28, fontSize: 12, color: "#6b7280" }}>{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <select
                                className="form-select"
                                style={{ width: 200 }}
                                value={filterRating}
                                onChange={(e) => setFilterRating(e.target.value)}
                            >
                                <option value="all">All ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Stars</option>
                            </select>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {filtered.length === 0 ? (
                                <div className="text-muted">No valid reviews.</div>
                            ) : (
                                filtered.map((r) => (
                                    <div key={r.id} className="card p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div style={{ fontWeight: 700 }}>
                                                {r.product?.name ?? "Product"}
                                            </div>
                                            <StarRating rating={Number(r.rating ?? 0)} />
                                        </div>
                                        <div className="mt-2">
                                            <div className="text-muted" style={{ fontSize: 13 }}>
                                                From: {r.user?.username ?? r.user?.email ?? "—"}
                                            </div>
                                            <div className="mt-1">{r.comment ?? "—"}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </SellerLayout>
    );
}

