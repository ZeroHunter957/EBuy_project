import React, { useState } from "react";
import { googleLogin, login } from "../api/authAPI";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GoogleLogin } from '@react-oauth/google';
import { toast } from "react-toastify";

export default function Login() {

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const res = await login(form);

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            const role = res.data.user.role.name;

            if (role === "ADMIN") navigate("/admin");
            else if (role === "SELLER") navigate("/seller");
            else navigate("/");

        } catch {
            toast.error("Invalid credentials");
        }

    };

    return (

        <div className="page">

            <Header />

            <div className="bg">

                <form className="card" onSubmit={handleSubmit}>

                    <h2>Sign in</h2>

                    <input
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                    />

                    <button>Login</button>


                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            try {
                                const { data } = await googleLogin(credentialResponse.credential);

                                localStorage.setItem("token", data.token);
                                localStorage.setItem("user", JSON.stringify(data.user));

                                const role = data.user.role.name;

                                if (role === "ADMIN") navigate("/admin");
                                else if (role === "SELLER") navigate("/seller");
                                else navigate("/");

                            } catch (err) {
                                toast.error(err?.response?.data?.message || err?.message || "Google login failed");
                            }
                        }}
                        onError={() => {
                            toast.error("Google login failed");
                        }}
                    />

                    <p>
                        No account?
                        <span onClick={() => navigate("/register")}>
                            Register
                        </span>
                    </p>

                </form>

            </div>

            <Footer />

            <style>{`

.page {
    min-height:100vh;
}

.bg {
    min-height:calc(100vh - 60px);
    display:flex;
    justify-content:center;
    align-items:center;
    background:linear-gradient(135deg,#ff9a9e,#fad0c4);
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

.card input {
    padding:10px;
    border-radius:10px;
    border:1px solid #ccc;
}

.card button {
    padding:10px;
    border:none;
    border-radius:20px;
    background:#2575fc;
    color:white;
    cursor:pointer;
}

.card span {
    color:#2575fc;
    cursor:pointer;
}

`}</style>

        </div>

    );

}
