import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { RouterProvider } from "react-router/dom";
import Home from "../pages/Home/Home";

import ForgotPassword from "../pages/auth/ForgotPassword/ForgotPassword";
import ErrorPage from "../pages/error/ErrorPage/ErrorPage";
import ErrorApp from "../pages/error/ErrorApp/ErrorApp";
import { ToastContainer } from "react-toastify";

import Register from "../pages/auth/Register/Register";
import Login from "../pages/auth/Login/Login";
import RootLayout from "../app/layouts/RootLayout/RootLayout";
import AuthProvider from "../app/providers/AuthProvider";
import AuthLayout from "../app/layouts/AuthLayout/AuthLayout";
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import DashboardLayout from "../app/layouts/DashboardLayout/DashboardLayout";
import PrivateRoute from "../app/routes/PrivateRoute/PrivateRoute";
import DashboardRedirect from "../app/routes/DashboardRedirect/DashboardRedirect";
import CustomerTicketsPage from "../pages/customer/CustomerTicketsPage";
import RoleRoute from "../app/routes/RoleRoute/RoleRoute";
import CustomerCreateTicketPage from "../pages/customer/CustomerCreateTicketPage";
import CustomerTicketDetailsPage from "../pages/customer/CustomerTicketDetailsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "../pages/Profile/Profile";

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
    ],
  },
  {
    path: "/",
    errorElement: <ErrorApp></ErrorApp>,
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardRedirect />,
      },
      
      // customer
      {
        path: "customer",
        element: (
          <RoleRoute role="customer">
            <Outlet></Outlet>
          </RoleRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            Component: CustomerDashboardPage,
          },
          // Ticket List
          {
            path: "tickets",
            Component: CustomerTicketsPage,
          },
          // Create Ticket
          {
            path: "tickets/new",
            Component: CustomerCreateTicketPage,
          },
          // Single Ticket
          {
            path: "tickets/:ticketId",
            Component: CustomerTicketDetailsPage,
          },
          {
            path: "profile",
            Component: Profile,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    Component: ErrorPage,
  },
]);

// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
