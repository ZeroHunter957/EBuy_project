import React, { useState } from "react";
import { register } from "../api/authAPI";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getAllCategories } from "../api/categoryAPI";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function SellerRegister() {

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        businessDescription: "",
        productDescription: ""
    });

    const [files, setFiles] = useState({
        citizenIdImage: null,
        businessCertImage: null
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        getAllCategories()
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));
    }, []);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleFileChange = (e) => {
        const { name, files: selected } = e.target;
        setFiles(prev => ({ ...prev, [name]: selected[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!files.citizenIdImage || !files.businessCertImage) {
            setError("Please upload required documents");
            return;
        }

        try {
            setLoading(true);

            // Register
            await register({
                username: form.username,
                email: form.email,
                password: form.password,
                roleId: 2
            });

            // Login
            const loginRes = await api.post("/auth/login", {
                email: form.email,
                password: form.password
            });

            const finalBusiness = selectedCategory
                ? selectedCategory + (form.businessDescription ? " - " + form.businessDescription : "")
                : form.businessDescription;

            const finalProduct = selectedCategory
                ? selectedCategory + (form.productDescription ? " - " + form.productDescription : "")
                : form.productDescription;

            const token = loginRes.data.token;

            const formData = new FormData();
            formData.append("citizenIdImage", files.citizenIdImage);
            formData.append("businessCertImage", files.businessCertImage);
            formData.append("businessDescription", finalBusiness);
            formData.append("productDescription", finalProduct);
            formData.append("categoryId", selectedCategory?.id);

            if (!selectedCategory && !form.productDescription) {
                setError("Please select a category or enter a description");
                return;
            }

            if (!selectedCategory) {
                setError("Please select a category");
                return;
            }

            await api.post("/seller/verify", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            toast.success("Registered as seller. Waiting for approval.");
            navigate("/login");

        } catch (err) {
            console.error(err);

            toast.error(
                err.response?.data?.message ||
                "Registration failed. Make sure images are uploaded correctly."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <Header />

            <div className="bg">
                <form className="card" onSubmit={handleSubmit}>

                    <h2>Seller Registration</h2>

                    <input name="username" placeholder="Username" onChange={handleChange} />
                    <input name="email" placeholder="Email" onChange={handleChange} />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} />

                    <label>Select Product Category</label>
                    <select
                        value={selectedCategory?.id || ""}
                        onChange={(e) => {
                            const selectedId = parseInt(e.target.value);
                            const category = categories.find(c => c.id === selectedId);

                            setSelectedCategory(category);

                            // use NAME for description
                            setForm(prev => ({
                                ...prev,
                                businessDescription: category.name,
                                productDescription: category.name
                            }));
                        }}
                    >
                        <option value="">-- Select category --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <textarea
                        name="businessDescription"
                        placeholder="Add more about your business (optional)"
                        value={form.businessDescription}
                        onChange={handleChange}
                    />

                    <textarea
                        name="productDescription"
                        placeholder="Add more about your products (optional)"
                        value={form.productDescription}
                        onChange={handleChange}
                    />

                    <label>Citizen ID</label>
                    <input type="file" name="citizenIdImage" onChange={handleFileChange} />

                    <label>Business Certificate</label>
                    <input type="file" name="businessCertImage" onChange={handleFileChange} />

                    {error && <div className="error">{error}</div>}

                    <button disabled={loading}>
                        {loading ? "Submitting..." : "Register as Seller"}
                    </button>

                    <p>
                        Just shopping?
                        <span onClick={() => navigate("/register")}>
                            Register as user
                        </span>
                    </p>

                </form>
            </div>

            <Footer />

            <style>{`
textarea {
    padding:10px;
    border-radius:10px;
    border:1px solid #ccc;
    resize:none;
    height:60px;
}

.error {
    color:red;
    font-size:13px;
}

.page {
    min-height:100vh;
}

.bg {
    min-height:calc(100vh - 60px);
    background:linear-gradient(135deg,#43cea2,#185a9d);
    display:flex;
    justify-content:center;
    align-items:center;
}

.layout {
    display:flex;
    gap:40px;
}

/* FORM */

.card {
    background:white;
    padding:30px;
    border-radius:14px;
    width:320px;
    box-shadow:0 8px 20px rgba(0,0,0,0.3);
    display:flex;
    flex-direction:column;
    gap:10px;
}

.card input,
.card select {
    padding:10px;
    border-radius:10px;
    border:1px solid #ccc;
}

.card button {
    padding:10px;
    border:none;
    border-radius:20px;
    background:#185a9d;
    color:white;
    cursor:pointer;
}

.card span {
    color:#185a9d;
    cursor:pointer;
}

/* INFO */

.info {
    display:flex;
    flex-direction:column;
    gap:20px;
}

.box {
    width:240px;
    background:white;
    border-radius:12px;
    padding:15px;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
}

.box h3 {
    margin-bottom:10px;
}

.box ul {
    padding-left:18px;
}

.roleSelect {
    display:flex;
    gap:12px;
    margin:10px 0;
}

.roleCard {
    flex:1;
    border:2px solid #ccc;
    border-radius:12px;
    padding:10px;
    text-align:center;
    cursor:pointer;
    transition:0.2s;
    background:#f9f9f9;
}

.roleCard:hover {
    transform:scale(1.05);
}

.roleCard.active {
    border:2px solid #185a9d;
    background:#e6f0ff;
    box-shadow:0 0 10px rgba(24,90,157,0.6);
    transform:scale(1.08);
}

.roleTitle {
    font-weight:bold;
    font-size:16px;
}

.roleDesc {
    font-size:12px;
    margin-top:5px;
    color:#555;
}

`}</style>

        </div>

    );

}