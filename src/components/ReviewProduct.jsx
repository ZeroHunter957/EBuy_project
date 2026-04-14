import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { addReview, getReviewsByProduct } from "../api/reviewAPI";
import { toast } from "react-toastify";

export default function ReviewProduct() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const load = async () => {
        try {
            const res = await getReviewsByProduct(productId);
            setReviews(res.data || []);
        } catch {
            setReviews([]);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.warn("Please login to review");
            navigate("/login");
            return;
        }

        if (!comment.trim()) {
            toast.warn("Comment is required");
            return;
        }

        try {
            await addReview({
                rating: Number(rating),
                comment,
                product: { id: Number(productId) },
                user: { id: user.id }
            });
            setComment("");
            setRating(5);
            await load();
            toast.success("Review added");
        } catch (e2) {
            toast.error(e2.response?.data?.message || e2.message || "Add review failed");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Reviews</h2>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/shop")}
                >
                    Back to shop
                </button>
            </div>

            <div className="card p-3 mb-3">
                <h4>Write a review</h4>
                <form onSubmit={handleSubmit} className="mt-3">
                    <div className="mb-3" style={{ maxWidth: 260 }}>
                        <label className="form-label">Rating</label>
                        <select
                            className="form-select"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                        >
                            {[1, 2, 3, 4, 5].map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Comment</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary" type="submit">
                        Submit review
                    </button>
                </form>
            </div>

            <h4>All reviews</h4>
            {reviews.length === 0 ? (
                <div className="text-muted mt-2">No reviews yet.</div>
            ) : (
                <div className="d-flex flex-column gap-2 mt-2">
                    {reviews.map((r) => (
                        <div key={r.id} className="card p-3">
                            <div className="d-flex justify-content-between">
                                <div style={{ fontWeight: 700 }}>
                                    {r.user?.username ?? "Unknown user"}
                                </div>
                                <div>
                                    <span className="badge bg-secondary">
                                        {r.rating}/5
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2">{r.comment}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

