export const getUser = () =>
    JSON.parse(localStorage.getItem("user"));

export const isAdmin = () =>
    getUser()?.role?.name === "ADMIN";

export const isUser = () =>
    getUser()?.role?.name === "USER";

export const isLoggedIn = () =>
    !!localStorage.getItem("token");
