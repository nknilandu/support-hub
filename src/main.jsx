import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Home from "../pages/Home/Home";

import ForgotPassword from "../pages/auth/ForgotPassword/ForgotPassword";
import ErrorPage from "../pages/error/ErrorPage/ErrorPage";
import ErrorApp from "../pages/error/ErrorApp/ErrorApp";
import LoadingPage from "../pages/loading/LoadingPage/LoadingPage";
import { ToastContainer } from "react-toastify";
import AuthProvider from "../providers/AuthProvider";
import Register from "../pages/auth/Register/Register";
import Login from "../pages/auth/Login/Login";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </AuthProvider>
  </StrictMode>,
);
