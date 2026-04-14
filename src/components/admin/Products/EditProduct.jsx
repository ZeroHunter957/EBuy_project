import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../../../api/productAPI";
import { getAllCategories } from "../../../api/categoryAPI";
import { saveImage, deleteImage } from "../../../api/productImageAPI";
import { toAbsoluteApiUrl } from "../../../api/config";
import { toast } from "react-toastify";

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState(0);
    const [categoryIds, setCategoryIds] = useState([]);
    const [description, setDescription] = useState("");
    const [available, setAvailable] = useState(true);
    const [categories, setCategories] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [primaryImageId, setPrimaryImageId] = useState(null);

    useEffect(() => {
        Promise.all([getProductById(id), getAllCategories()])
            .then(([productRes, categoriesRes]) => {
                const p = productRes.data;
                setName(p.name || "");
                setPrice(p.price ?? "");
                setStock(p.stock ?? 0);
                setCategoryIds(p.categories?.map((c) => c.id.toString()) || []);
                setDescription(p.description || "");
                setAvailable(p.available ?? true);
                setCategories(categoriesRes.data);
                const imgs = p.images || [];
                setExistingImages(imgs);
                const primary = imgs.find((i) => i.primary);
                if (primary) setPrimaryImageId(primary.id);
            })
            .catch(() => toast.error("Failed to load product"))
            .finally(() => setLoading(false));
    }, [id]);

    const getImageUrl = (img) => {
        if (!img?.imageUrl) return "";
        return toAbsoluteApiUrl(img.imageUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || price === "" || categoryIds.length === 0) {
            toast.warn("Fill required fields");
            return;
        }

        try {
            await updateProduct(id, {
                name,
                price: Number(price),
                stock: Number(stock),
                description,
                available,
                categoryIds: categoryIds.map((itemId) => Number(itemId))
            });

            const keptExisting = existingImages.filter((img) => !imagesToDelete.includes(img.id));
            const noExisting = keptExisting.length === 0;

            for (const imgId of imagesToDelete) {
                await deleteImage(imgId);
            }

            for (let i = 0; i < newImages.length; i++) {
                const formData = new FormData();
                formData.append("file", newImages[i].file);
                formData.append("productId", Number(id));
                formData.append("primary", noExisting && i === 0 ? "true" : "false");
                await saveImage(formData);
            }

            toast.success("Updated");
            navigate("/admin/products");
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files).map((file) => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setNewImages((prev) => [...prev, ...files]);
        e.target.value = "";
    };

    const markImageForDelete = (imgId) => {
        setImagesToDelete((prev) => [...prev, imgId]);
        if (primaryImageId === imgId) setPrimaryImageId(null);
    };

    const unmarkImageForDelete = (imgId) => {
        setImagesToDelete((prev) => prev.filter((item) => item !== imgId));
    };

    const removeNewImage = (index) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCategoryChange = (e) => {
        const values = Array.from(e.target.selectedOptions, (option) => option.value);
        setCategoryIds(values);
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <h2>Edit Product</h2>

            <form className="card p-4 mt-3" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Product Name</label>
                    <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input type="number" step="0.01" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Stock</label>
                    <input type="number" min="0" className="form-control" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label>Description</label>
                    <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
                    <label className="form-check-label">Available</label>
                </div>

                <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select multiple className="form-select" value={categoryIds} onChange={handleCategoryChange}>
                        <option value="">Select category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <small>Select multiple with Ctrl / Shift</small>
                </div>

                <div className="mb-3">
                    <label className="form-label">Product images</label>
                    <p className="text-muted small mb-2">Current images: click Delete to remove. Select new files to upload. First image becomes main if none remain.</p>

                    {(() => {
                        const keptImages = existingImages.filter((img) => !imagesToDelete.includes(img.id));
                        const primaryDeleted = imagesToDelete.includes(primaryImageId);
                        const effectivePrimaryId = primaryDeleted ? keptImages[0]?.id : primaryImageId;

                        return keptImages.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mb-2">
                                {keptImages.map((img) => (
                                    <div key={img.id} className="position-relative border rounded p-1" style={{ width: 90 }}>
                                        <img
                                            src={getImageUrl(img)}
                                            alt={name || "product"}
                                            className="img-thumbnail d-block"
                                            style={{ width: 80, height: 80, objectFit: "cover" }}
                                        />
                                        {(img.primary || img.id === effectivePrimaryId) && (
                                            <span className="badge bg-success position-absolute top-0 start-0 m-1">Main image</span>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                            style={{ padding: "2px 6px", fontSize: 12 }}
                                            onClick={() => markImageForDelete(img.id)}
                                            title="Delete this image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {imagesToDelete.length > 0 && (
                        <div className="mb-2">
                            <span className="text-muted small">Marked for deletion: </span>
                            {existingImages.filter((img) => imagesToDelete.includes(img.id)).map((img) => (
                                <span key={img.id} className="badge bg-secondary me-1">
                                    #{img.id} image
                                    <button type="button" className="btn btn-link p-0 ms-1 text-white" onClick={() => unmarkImageForDelete(img.id)}>
                                        Undo
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <input type="file" className="form-control mt-2" multiple accept="image/*" onChange={handleNewImageChange} placeholder="Select new images..." />

                    {newImages.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {(() => {
                                const keptExisting = existingImages.filter((img) => !imagesToDelete.includes(img.id));
                                const noExistingKept = keptExisting.length === 0;
                                return newImages.map((img, index) => (
                                    <div key={index} className="position-relative border rounded p-1" style={{ width: 90 }}>
                                        <img src={img.preview} alt="preview" className="img-thumbnail d-block" style={{ width: 80, height: 80, objectFit: "cover" }} />
                                        {noExistingKept && index === 0 && (
                                            <span className="badge bg-success position-absolute top-0 start-0 m-1">Main image</span>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                            style={{ padding: "2px 6px", fontSize: 12 }}
                                            onClick={() => removeNewImage(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/products")}>Cancel</button>
                </div>
            </form>
        </>
    );
}
