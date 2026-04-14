import api from "./axios";

// ---------- AUTH ----------

// Login (ADMIN or USER)
export const login = (data) =>
    api.post("/auth/login", data);

export const googleLogin = (token) =>
    api.post("/auth/google", { token });

// UserRegister (USER)
export const register = (data) =>
    api.post("/auth/register", data);

// Logout helper
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
