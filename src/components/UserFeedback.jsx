import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getFeedbackByUser,
    addFeedback
} from "../api/feedbackAPI";
import { toast } from "react-toastify";

export default function UserFeedback() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const load = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await getFeedbackByUser(user.id);
            setItems(res.data || []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.warn("Please login first");
            navigate("/login");
            return;
        }

        if (!message.trim()) {
            toast.warn("Message is required");
            return;
        }

        try {
            await addFeedback({ message });
            setMessage("");
            await load();
            toast.success("Feedback sent");
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Send failed");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>My Feedback</h2>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/shop")}
                >
                    Back to shop
                </button>
            </div>

            <div className="card p-3 mb-3">
                <h4>Send feedback</h4>
                <form onSubmit={handleSubmit} className="mt-3">
                    <div className="mb-3">
                        <label className="form-label">Message</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" type="submit">
                        Submit
                    </button>
                </form>
            </div>

            <h4>History</h4>
            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : items.length === 0 ? (
                <div className="text-muted">No feedback yet.</div>
            ) : (
                <div className="d-flex flex-column gap-2 mt-2">
                    {items.map((fb) => (
                        <div key={fb.id} className="card p-3">
                            <div className="d-flex justify-content-between">
                                <div style={{ fontWeight: 700 }}>
                                    {fb.processed ? "Processed" : "Unprocessed"}
                                </div>
                                <div>
                                    <span
                                        className={`badge ${
                                            fb.processed ? "bg-success" : "bg-warning text-dark"
                                        }`}
                                    >
                                        {fb.processed ? "DONE" : "NEW"}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2">{fb.message}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

