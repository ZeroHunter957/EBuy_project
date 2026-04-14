import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../../api/productAPI";
import { getAllCategories } from "../../../api/categoryAPI";
import { saveImage } from "../../../api/productImageAPI";
import { toast } from "react-toastify";

export default function AddProduct() {

    const user = JSON.parse(localStorage.getItem("user"));

    const navigate = useNavigate();

    // ---------- form state ----------
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");

    const [categoryIds, setCategoryIds] = useState([]);
    const [categories, setCategories] = useState([]);

    const [images, setImages] = useState([]);
    const [primaryIndex, setPrimaryIndex] = useState(0);


    // ---------- load categories ----------
    useEffect(() => {
        getAllCategories().then(res => setCategories(res.data));
    }, []);


    // ---------- submit ----------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || price === "" || stock === "" || categoryIds.length === 0) {
            toast.warn("Fill all fields");
            return;
        }

        try {
            // 1. create product
            const productRes = await createProduct({
                name,
                price: Number(price),
                stock: Number(stock),
                description,
                sellerId: user.id,
                categoryIds: categoryIds.map(id => Number(id))
            });

            const productId = productRes?.data?.id;
            if (!productId) {
                throw new Error("Create product succeeded but missing product id");
            }

            // 2. upload images (optional)
            for (let i = 0; i < images.length; i++) {
                const formData = new FormData();
                formData.append("file", images[i].file);
                formData.append("productId", Number(productId));
                formData.append("primary", i === primaryIndex ? "true" : "false");
                await saveImage(formData);
            }

            toast.success("Product added");
            navigate("/admin/products");

        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Create failed"
            );
        }
    };


    // ---------- image select ----------
    const handleImageChange = (e) => {

        const files = Array.from(e.target.files).map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...files]);

        e.target.value = "";
    };


    // ---------- category multi select ----------
    const handleCategoryChange = (e) => {

        const values = Array.from(
            e.target.selectedOptions,
            option => option.value
        );

        setCategoryIds(values);
    };


    // ---------- UI ----------
    return (
        <>
            <h2>Add Product</h2>

            <form className="card p-4 mt-3" onSubmit={handleSubmit}>

                {/* name */}
                <div className="mb-3">
                    <label>Name</label>
                    <input
                        className="form-control"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>


                {/* price */}
                <div className="mb-3">
                    <label>Price</label>
                    <input
                        type="number"
                        className="form-control"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                    />
                </div>


                {/* stock */}
                <div className="mb-3">
                    <label>Stock</label>
                    <input
                        type="number"
                        className="form-control"
                        value={stock}
                        onChange={e => setStock(e.target.value)}
                    />
                </div>


                {/* description */}
                <div className="mb-3">
                    <label>Description</label>
                    <textarea
                        className="form-control"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>


                {/* categories multi */}
                <div className="mb-3">
                    <label>Categories</label>

                    <select
                        multiple
                        className="form-select"
                        value={categoryIds}
                        onChange={handleCategoryChange}
                    >
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <small>Select multiple with Ctrl / Shift</small>
                </div>


                {/* images */}
                <div className="mb-3">
                    <label>Images</label>

                    <input
                        type="file"
                        multiple
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>


                {/* preview */}
                {images.length > 0 && (

                    <div className="mb-3">

                        <label>Click to set primary</label>

                        <div className="d-flex flex-wrap gap-3">

                            {images.map((img, index) => (

                                <div
                                    key={index}
                                    onClick={() => setPrimaryIndex(index)}
                                    className={`border p-2 ${
                                        index === primaryIndex
                                            ? "border-success border-3"
                                            : ""
                                    }`}
                                    style={{ width: 120, cursor: "pointer" }}
                                >

                                    <img
                                        src={img.preview}
                                        alt=""
                                        style={{
                                            height: 80,
                                            width: "100%",
                                            objectFit: "cover"
                                        }}
                                    />

                                    {index === primaryIndex && (
                                        <div className="text-success">
                                            Primary
                                        </div>
                                    )}

                                </div>

                            ))}

                        </div>

                    </div>

                )}


                <button className="btn btn-success">
                    Add Product
                </button>

            </form>
        </>
    );
}