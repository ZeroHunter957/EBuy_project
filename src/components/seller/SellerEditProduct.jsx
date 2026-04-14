import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../../api/productAPI";
import { getAllCategories } from "../../api/categoryAPI";
import { saveImage, deleteImage } from "../../api/productImageAPI";
import SellerLayout from "./SellerLayout";
import { toAbsoluteApiUrl } from "../../api/config";
import { toast } from "react-toastify";

export default function SellerEditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState(0);
    const [description, setDescription] = useState("");
    const [categoryIds, setCategoryIds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [available, setAvailable] = useState(true);
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [primaryImageId, setPrimaryImageId] = useState(null);

    const unmarkImageForDelete = (imgId) => {
        setImagesToDelete((prev) => prev.filter((id) => id !== imgId));
    };

    useEffect(() => {
        Promise.all([getProductById(id), getAllCategories()])
            .then(([pRes, cRes]) => {
                const p = pRes.data;

                setName(p.name || "");
                setPrice(p.price ?? "");
                setStock(p.stock ?? 0);
                setDescription(p.description || "");
                setAvailable(p.available ?? true);
                setCategoryIds(p.categories?.map((c) => c.id.toString()) || []);
                setCategories(cRes.data || []);

                const imgs = p.images || [];
                setExistingImages(imgs);

                const primary = imgs.find((i) => i.primary);
                if (primary) setPrimaryImageId(primary.id);
            })
            .catch(() => toast.error("Load failed"))
            .finally(() => setLoading(false));
    }, [id]);

    const getImageUrl = (img) => {
        if (!img?.imageUrl) return "";
        return toAbsoluteApiUrl(img.imageUrl);
    };

    const handleCategoryChange = (e) => {
        const values = Array.from(e.target.selectedOptions, (o) => o.value);
        setCategoryIds(values);
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files).map((file) => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setNewImages((prev) => [...prev, ...files]);
        e.target.value = "";
    };

    const removeNewImage = (index) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const markImageForDelete = (imageId) => {
        setImagesToDelete((prev) => [...prev, imageId]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateProduct(id, {
                name,
                price: Number(price),
                stock: Number(stock),
                description,
                categoryIds: categoryIds.map(Number),
                available
            });

            const kept = existingImages.filter((img) => !imagesToDelete.includes(img.id));
            const noExisting = kept.length === 0;

            for (const imgId of imagesToDelete) {
                await deleteImage(imgId);
            }

            for (let i = 0; i < newImages.length; i++) {
                const formData = new FormData();
                formData.append("file", newImages[i].file);
                formData.append("productId", Number(id));
                formData.append("primary", noExisting && i === 0);
                await saveImage(formData);
            }

            toast.success("Updated");
            navigate("/seller");
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    if (loading) {
        return (
            <SellerLayout>
                <div className="text-center py-5">Loading...</div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <h2>Edit Product</h2>

            <form className="card p-4 mt-3" onSubmit={handleSubmit}>
                <input className="form-control mb-2" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="number" className="form-control mb-2" value={price} onChange={(e) => setPrice(e.target.value)} />
                <input type="number" className="form-control mb-2" value={stock} onChange={(e) => setStock(e.target.value)} />
                <textarea className="form-control mb-2" value={description} onChange={(e) => setDescription(e.target.value)} />

                <select multiple className="form-select mb-2" value={categoryIds} onChange={handleCategoryChange}>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <div className="mb-2">
                    {available ? <span className="badge bg-success">Enabled</span> : <span className="badge bg-danger">Disabled</span>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Product images</label>
                    <p className="text-muted small mb-2">
                        Current images: click Delete to remove. Select new files to upload. First image becomes the main image if none remain.
                    </p>

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
                                            <span className="badge bg-success position-absolute top-0 start-0 m-1">
                                                Main image
                                            </span>
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
                            {existingImages
                                .filter((img) => imagesToDelete.includes(img.id))
                                .map((img) => (
                                    <span key={img.id} className="badge bg-secondary me-1">
                                        #{img.id} image
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 ms-1 text-white"
                                            onClick={() => unmarkImageForDelete(img.id)}
                                        >
                                            Undo
                                        </button>
                                    </span>
                                ))}
                        </div>
                    )}

                    <input
                        type="file"
                        className="form-control mt-2"
                        multiple
                        accept="image/*"
                        onChange={handleNewImageChange}
                        placeholder="Select new images..."
                    />

                    {newImages.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {(() => {
                                const keptExisting = existingImages.filter((img) => !imagesToDelete.includes(img.id));
                                const noExistingKept = keptExisting.length === 0;
                                return newImages.map((img, index) => (
                                    <div key={index} className="position-relative border rounded p-1" style={{ width: 90 }}>
                                        <img
                                            src={img.preview}
                                            alt="preview"
                                            className="img-thumbnail d-block"
                                            style={{ width: 80, height: 80, objectFit: "cover" }}
                                        />
                                        {noExistingKept && index === 0 && (
                                            <span className="badge bg-success position-absolute top-0 start-0 m-1">
                                                Main image
                                            </span>
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

                <button className="btn btn-primary">Save</button>
            </form>
        </SellerLayout>
    );
}
