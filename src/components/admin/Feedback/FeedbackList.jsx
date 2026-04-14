import React, { useEffect, useState } from "react";
import {
    getAllFeedback,
    markFeedbackProcessed,
    getUnreadFeedbackCount,
} from "../../../api/feedbackAPI";
import { toast } from "react-toastify";

export default function FeedbackList() {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadData = () => {
        setLoading(true);
        Promise.all([getAllFeedback(), getUnreadFeedbackCount()])
            .then(([listRes, countRes]) => {
                setFeedback(listRes.data ?? []);
                setUnreadCount(countRes.data?.count ?? 0);
            })
            .catch(() => {
                setFeedback([]);
                setUnreadCount(0);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <>
            <div className="d-flex justify-content-between align-items-center">
                <h2>Feedback</h2>
                <span className="badge bg-warning text-dark">
                    Unprocessed feedback: {unreadCount}
                </span>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <table className="table mt-3">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {feedback.map((f) => (
                        <tr key={f.id}>
                            <td>{f.id}</td>
                            <td>{f.user?.username}</td>
                            <td>{f.message}</td>
                            <td>
                                {f.createdAt
                                    ? new Date(f.createdAt).toLocaleString("vi-VN")
                                    : "—"}
                            </td>
                            <td>
                                {f.processed ? (
                                    <span className="badge bg-success">Processed feedbacks</span>
                                ) : (
                                    <span className="badge bg-warning text-dark">
                                            New
                                        </span>
                                )}
                            </td>
                            <td>
                                {!f.processed && (
                                    <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={async () => {
                                            try {
                                                await markFeedbackProcessed(f.id);
                                                loadData();
                                            } catch (err) {
                                                toast.error(
                                                    err.response?.data?.message ||
                                                    "Processing failed"
                                                );
                                            }
                                        }}
                                    >
                                        Feedback processed
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </>
    );
}
