import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./components/Login";
import UserRegister from "./components/UserRegister";
import SellerRegister from "./components/SellerRegister";
import Home from "./components/Home";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import CategoryList from "./components/admin/Categories/CategoryList";
import ProductList from "./components/admin/Products/ProductList";
import OrderList from "./components/admin/Orders/OrderList";
import AddCategory from "./components/admin/Categories/AddCategory";
import EditCategory from "./components/admin/Categories/EditCategory";
import AddProduct from "./components/admin/Products/AddProduct";
import UserList from "./components/admin/Users/UserList";
import FeedbackList from "./components/admin/Feedback/FeedbackList";
import EditProduct from "./components/admin/Products/EditProduct";
import AdminProductDetail from "./components/admin/Products/AdminProductDetail";
import AdminPendingProducts from "./components/admin/Products/AdminPendingProducts";
import AdminOrderDetail from "./components/admin/Orders/AdminOrderDetail";
import UserLayout from "./components/UserLayout";
import Shop from "./components/Shop";
import SellerDashboard from "./components/seller/SellerDashboard";
import SellerCreateProduct from "./components/seller/SellerCreateProduct";
import SellerEditProduct from "./components/seller/SellerEditProduct";
import SellerOrders from "./components/seller/SellerOrders";
import SellerOrderDetail from "./components/seller/SellerOrderDetail";
import SellerReviews from "./components/seller/SellerReviews";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Payment from "./components/Payment";
import OrderSuccess from "./components/OrderSuccess";
import ReviewProduct from "./components/ReviewProduct";
import UserFeedback from "./components/UserFeedback";
import ProductDetails from "./components/ProductDetails";
import SellerVerificationList from "./components/admin/Users/SellerVerificationList";

function App() {
        return (
        <BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
            <Routes>
                {/* layout wrapper */}
                <Route element={<UserLayout />}>

                    <Route path="/" element={<Home />} />

                    <Route path="/shop" element={<Shop />} />

                    <Route path="/cart" element={<Cart />} />

                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                    <Route path="/product/:id" element={<ProductDetails />} />

                    <Route
                        path="/reviews/:productId"
                        element={<ReviewProduct />}
                    />

                    <Route path="/feedback" element={<UserFeedback />} />

                </Route>

                {/* ========== SELLER ========== */}
                <Route path="/seller" element={<SellerDashboard />} />
                <Route path="/seller/create-product" element={<SellerCreateProduct />} />
                <Route
                    path="/seller/products/edit/:id"
                    element={<SellerEditProduct />}
                />
                <Route path="/seller/orders" element={<SellerOrders />} />
                <Route
                    path="/seller/orders/:id"
                    element={<SellerOrderDetail />}
                />
                <Route path="/seller/reviews" element={<SellerReviews />} />

                {/* ========== Login/UserRegister ========== */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<UserRegister />} />
                <Route path="/register-seller" element={<SellerRegister />} />

                {/* ========== ADMIN (protected by AdminRoute) ========== */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    {/* Admin Dashboard */}
                    <Route index element={<AdminDashboard />} />

                    {/* manage products */}
                    <Route path="products" element={<ProductList />} />
                    <Route
                        path="products/pending"
                        element={<AdminPendingProducts />}
                    />
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="products/edit/:id" element={<EditProduct />} />
                    <Route path="products/detail/:id" element={<AdminProductDetail />} />

                    {/* manage categories */}
                    <Route path="categories" element={<CategoryList />} />
                    <Route path="categories/add" element={<AddCategory />} />
                    <Route
                        path="categories/edit/:id"
                        element={<EditCategory />}
                    />

                    {/* manage orders */}
                    <Route path="orders" element={<OrderList />} />
                    <Route path="orders/:id" element={<AdminOrderDetail />} />

                    {/* manage users */}
                    <Route path="users" element={<UserList />} />

                    {/* manage sellers */}
                    <Route path="pending-verifications" element={<SellerVerificationList />} />

                    {/* manage feedback */}
                    <Route path="feedback" element={<FeedbackList />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
