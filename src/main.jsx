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

import Register from "../pages/auth/Register/Register";
import Login from "../pages/auth/Login/Login";
import RootLayout from "../app/layouts/RootLayout/RootLayout";
import AuthProvider from "../app/providers/AuthProvider";
import AuthLayout from "../app/layouts/AuthLayout/AuthLayout";
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import DashboardLayout from "../app/layouts/DashboardLayout/DashboardLayout";
import PrivateRoute from "../app/routes/PrivateRoute/PrivateRoute";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorApp></ErrorApp>,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "*",
        Component: ErrorPage,
      },
    ],
  },
  {
    path: "/",
    Component: AuthLayout,
    errorElement: <ErrorApp></ErrorApp>,
    children: [
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
      {
        path: "forgot-password",
        Component: ForgotPassword,
      },
      {
        path: "*",
        Component: ErrorPage,
      },
    ],
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardLayout></DashboardLayout>
      </PrivateRoute>
    ),
    errorElement: <ErrorApp></ErrorApp>,
    children: [
      {
        path: "customer",
        Component: CustomerDashboardPage,
      },
      {
        path: "customer/dashboard",
        Component: CustomerDashboardPage,
      },
      {
        path: "forgot-password",
        Component: ForgotPassword,
      },
      {
        path: "*",
        Component: ErrorPage,
      },
    ],
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
