import React, { useState } from "react";
import { createCategory } from "../../../api/categoryAPI";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AddCategory() {
    const navigate = useNavigate();
    const [name, setName] = useState("");

    const handleAdd = async () => {
        if (!name) return;
        try {
            await createCategory({ name });
            toast.success("Category created successfully");
            navigate("/admin/categories");
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to create category");
        }
    };

    return (
        <div className="d-flex gap-2 my-3">
            <input
                className="form-control"
                placeholder="New category"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAdd}>
                Add
            </button>
        </div>
    );
}
