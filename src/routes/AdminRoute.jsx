import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const { exp, role } = decoded;

        // expired
        if (Date.now() >= exp * 1000) {
            localStorage.clear();
            return <Navigate to="/login" replace />;
        }

        // role check (match backend claim!)
        if (role !== "ADMIN") {
            return <Navigate to="/login" replace />;
        }

        return children;
    } catch {
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }
}
