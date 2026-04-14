import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { toAbsoluteApiUrl } from "../../../api/config";
import { toast } from "react-toastify";

export default function SellerVerificationList() {
    const [verifications, setVerifications] = useState([]);
    const [rejectReasons, setRejectReasons] = useState({});
    const [filter, setFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [zoomImage, setZoomImage] = useState(null);

    const itemsPerPage = 4;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get("/admin/verifications");
            const data = res.data;

            let list = Array.isArray(data) ? data : Array.isArray(data.content) ? data.content : [];

            list.sort((a, b) => {
                if (a.status === "REJECTED") return 1;
                if (b.status === "REJECTED") return -1;
                return 0;
            });

            setVerifications(list);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load verifications");
            setVerifications([]);
        }
    };

    const approve = async (userId) => {
        await api.post(`/admin/approve-seller/${userId}`);
        loadData();
    };

    const reject = async (userId) => {
        const reason = rejectReasons[userId];

        if (!reason || reason.trim() === "") {
            toast.warn("Please enter a rejection reason");
            return;
        }

        await api.post(`/admin/reject-seller/${userId}?reason=${encodeURIComponent(reason)}`);
        loadData();
    };

    const filtered = verifications.filter((v) => (filter === "ALL" ? true : v.status === filter));
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div>
            <h2>Seller Verification Requests</h2>

            <div className="filters">
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
                    <button
                        key={f}
                        className={filter === f ? "activeFilter" : ""}
                        onClick={() => {
                            setFilter(f);
                            setPage(1);
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="list">
                {paginated.map((v) => {
                    const isProcessed = v.status !== "PENDING";

                    return (
                        <div key={v.id} className="card">
                            <h3>{v.user?.username}</h3>
                            <p className={`status ${v.status.toLowerCase()}`}>{v.status}</p>

                            <div className="section">
                                <b>Business Description</b>
                                <p>{v.businessDescription}</p>
                            </div>

                            <div className="section">
                                <b>Product Description</b>
                                <p>{v.productDescription}</p>
                            </div>

                            <div className="images">
                                <div
                                    className="imageBox"
                                    onClick={() => setZoomImage(toAbsoluteApiUrl(v.citizenIdImageUrl))}
                                >
                                    Click to view Citizen ID
                                </div>

                                <div
                                    className="imageBox"
                                    onClick={() => setZoomImage(toAbsoluteApiUrl(v.businessCertImageUrl))}
                                >
                                    Click to view Business Cert
                                </div>
                            </div>

                            <textarea
                                placeholder="Enter rejection reason..."
                                value={rejectReasons[v.user?.id] || ""}
                                onChange={(e) =>
                                    setRejectReasons((prev) => ({
                                        ...prev,
                                        [v.user.id]: e.target.value
                                    }))
                                }
                            />

                            <div className="actions">
                                <button className="approve" disabled={isProcessed} onClick={() => approve(v.user.id)}>
                                    Approve
                                </button>

                                <button className="reject" disabled={isProcessed} onClick={() => reject(v.user.id)}>
                                    Reject
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    Prev
                </button>

                <span>Page {page} / {totalPages}</span>

                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                </button>
            </div>

            {zoomImage && (
                <div className="modal" onClick={() => setZoomImage(null)}>
                    <img src={zoomImage} alt="zoomed" />
                </div>
            )}

            <style>{`
.filters {
    display:flex;
    gap:10px;
    margin-bottom:15px;
}
.filters button {
    padding:6px 12px;
    border:none;
    border-radius:8px;
    cursor:pointer;
    background:#ddd;
}
.activeFilter {
    background:#185a9d;
    color:white;
}
.list {
    display:flex;
    flex-wrap:wrap;
    gap:20px;
}
.card {
    width:320px;
    background:white;
    border-radius:14px;
    padding:15px;
    box-shadow:0 4px 12px rgba(0,0,0,0.2);
    display:flex;
    flex-direction:column;
    gap:10px;
}
.status {
    font-size:12px;
}
.status.pending { color:orange; }
.status.approved { color:green; }
.status.rejected { color:red; }
.images {
    display:flex;
    gap:10px;
}
.imageBox {
    flex:1;
    height:80px;
    background:#eee;
    border-radius:8px;
    display:flex;
    justify-content:center;
    align-items:center;
    cursor:pointer;
    font-size:12px;
    text-align:center;
}
textarea {
    padding:8px;
    border-radius:8px;
    border:1px solid #ccc;
    resize:none;
    height:60px;
}
.actions {
    display:flex;
    gap:10px;
}
button {
    flex:1;
    padding:10px;
    border:none;
    border-radius:10px;
    cursor:pointer;
    font-weight:bold;
}
.approve {
    background:#28a745;
    color:white;
}
.reject {
    background:#dc3545;
    color:white;
}
.pagination {
    margin-top:20px;
    display:flex;
    justify-content:center;
    gap:10px;
}
.modal {
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.8);
    display:flex;
    justify-content:center;
    align-items:center;
}
.modal img {
    max-width:90%;
    max-height:90%;
    border-radius:10px;
}
`}</style>
        </div>
    );
}
