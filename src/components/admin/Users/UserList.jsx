import React, { useEffect, useState } from "react";
import {getAllUsers, disableUser, enableUser} from "../../../api/UserAPI";
import { toast } from "react-toastify";

export default function UserList() {

    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const res = await getAllUsers();
        const data = res.data;

        if (Array.isArray(data)) {
            setUsers(data);
        } else if (data.content) {
            setUsers(data.content);
        } else {
            setUsers([]);
        }
    };

    const handleDisable = async (id) => {
        if (!window.confirm("Disable this user?")) return;

        try {
            await disableUser(id);

            setUsers(prev =>
                prev.map(u =>
                    u.id === id ? { ...u, enabled: false } : u
                )
            );

        } catch {
            toast.error("Failed to disable user");
        }
    };

    // ✅ FILTER LOGIC
    const filteredUsers = users.filter(u => {
        if (filter === "ALL") return true;
        if (filter === "DISABLED") return !u.enabled;
        return u.role?.name === filter;
    });

    const handleEnable = async (id) => {
        try {
            await enableUser(id);

            setUsers(prev =>
                prev.map(u =>
                    u.id === id ? { ...u, enabled: true } : u
                )
            );
        } catch {
            toast.error("Failed to enable user");
        }
    };

    return (
        <div>

            <h2>User Management</h2>

            {/* ✅ FILTER BUTTONS */}
            <div className="filters">
                {["ALL", "USER", "SELLER", "ADMIN", "DISABLED"].map(f => (
                    <button
                        key={f}
                        className={filter === f ? "active" : ""}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <table className="table">

                <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Seller Status</th>
                    <th>Products</th>
                    <th>Account</th>
                    <th>Actions</th>
                </tr>
                </thead>

                <tbody>
                {filteredUsers.map(u => {

                    const isSeller = u.role?.name === "SELLER";

                    return (
                        <tr key={u.id}>

                            <td>{u.id}</td>

                            <td>{u.username}</td>

                            <td>
                                <span className={`role ${u.role?.name?.toLowerCase()}`}>
                                    {u.role?.name}
                                </span>
                            </td>

                            {/* ✅ Seller approval */}
                            <td>
                                {isSeller ? (
                                    u.sellerApproved ? (
                                        <span className="approved">Approved</span>
                                    ) : (
                                        <span className="pending">Pending</span>
                                    )
                                ) : "-"}
                            </td>

                            {/* ✅ Product count */}
                            <td>
                                {isSeller ? (u.productCount ?? 0) : "-"}
                            </td>

                            {/* ✅ Enabled / Disabled */}
                            <td>
                                {u.enabled ? (
                                    <span className="active">Active</span>
                                ) : (
                                    <span className="disabled">Disabled</span>
                                )}
                            </td>

                            <td>
                                {u.enabled ? (
                                    <button
                                        className="disableBtn"
                                        onClick={() => handleDisable(u.id)}
                                    >
                                        Disable
                                    </button>
                                ) : (
                                    <button
                                        className="enableBtn"
                                        onClick={() => handleEnable(u.id)}
                                    >
                                        Enable
                                    </button>
                                )}
                            </td>

                        </tr>
                    );
                })}
                </tbody>

            </table>

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

.filters .active {
    background:#185a9d;
    color:white;
}

/* ROLE COLORS */
.role {
    padding:4px 8px;
    border-radius:6px;
    font-size:12px;
    font-weight:bold;
}

.role.user { background:#eee; }
.role.seller { background:#d1ecf1; }
.role.admin { background:#f8d7da; }

/* STATUS */
.active { color:green; }
.disabled { color:red; }

.approved {
    color:green;
    font-weight:bold;
}

.pending {
    color:orange;
}

/* BUTTON */
.disableBtn {
    padding:6px 10px;
    border:none;
    border-radius:6px;
    background:#ffc107;
    cursor:pointer;
}

.disableBtn:hover {
    background:#e0a800;
}

.enableBtn {
    padding:6px 10px;
    border:none;
    border-radius:6px;
    background:#28a745;
    color:white;
    cursor:pointer;
}

.enableBtn:hover {
    background:#218838;
}

table {
    width:100%;
    background:white;
    border-radius:10px;
    overflow:hidden;
}

th, td {
    padding:10px;
    text-align:left;
}

`}</style>

        </div>
    );
}