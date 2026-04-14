import React, { useState } from "react";
import { register } from "../api/authAPI";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function UserRegister() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);
            await register({
                ...form,
                roleId: 0
            });
            toast.success("Registered successfully!");
            navigate("/login");
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || "Registration failed";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <Header />

            <div className="bg">
                <form className="card" onSubmit={handleSubmit}>
                    <h2>Create User Account</h2>

                    <input name="username" placeholder="Username" onChange={handleChange} />
                    <input name="email" placeholder="Email" onChange={handleChange} />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} />

                    {error && <div className="error">{error}</div>}

                    <button disabled={loading}>{loading ? "Registering..." : "Register"}</button>

                    <p>
                        Want to sell?
                        <span onClick={() => navigate("/register-seller")}>Become a seller</span>
                    </p>
                </form>
            </div>

            <Footer />

            <style>{`
.error {
    color:red;
    font-size:13px;
    margin-bottom:5px;
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
