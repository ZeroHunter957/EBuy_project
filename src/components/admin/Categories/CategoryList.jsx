import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../../../api/categoryAPI";

export default function CategoryList() {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await getAllCategories();
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Categories</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/admin/categories/add")}
                >
                    + Add Category
                </button>
            </div>

            <div className="row">
                {categories.map((c) => (
                    <div key={c.id} className="col-md-6 col-lg-4">
                        <div className="card mb-3 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{c.name}</h5>

                                <div className="text-muted small mb-2">
                                    ID: {c.id}
                                </div>

                                <div className="mb-2">
                                    <span className="badge bg-info">
                                        {c.productCount ?? 0} products
                                    </span>

                                    {(c.productCount ?? 0) === 0 && (
                                        <span className="badge bg-warning ms-2">
                                            Empty
                                        </span>
                                    )}
                                </div>

                                {c.createdAt && (
                                    <div className="small text-muted">
                                        Created: {new Date(c.createdAt).toLocaleDateString()}
                                    </div>
                                )}

                                <div className="mt-3 d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => navigate(`/admin/categories/edit/${c.id}`)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}