import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getCategoryById,
    updateCategory
} from "../../../api/categoryAPI";
import { toast } from "react-toastify";

export default function EditCategory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategoryById(id)
            .then((res) => setName(res.data?.name ?? ""))
            .catch(() => toast.error("Failed to load category"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name) return;

        try {
            await updateCategory(id, { name });
            toast.success("Category updated");
            navigate("/admin/categories");
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                Loading...
            </div>
        );
    }

    return (
        <div>
            <h2>Edit Category</h2>
            <form className="card p-4 mt-3" onSubmit={handleSave}>
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-primary" type="submit">
                        Save
                    </button>
                    <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => navigate("/admin/categories")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

