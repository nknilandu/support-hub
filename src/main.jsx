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
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import DashboardLayout from "../app/layouts/DashboardLayout/DashboardLayout";
import PrivateRoute from "../app/routes/PrivateRoute/PrivateRoute";
import DashboardRedirect from "../app/routes/DashboardRedirect/DashboardRedirect";
import CustomerTickets from "../pages/customer/CustomerTickets";
import RoleRoute from "../app/routes/RoleRoute/RoleRoute";
import CustomerCreateTicket from "../pages/customer/CustomerCreateTicket";
import CustomerTicketDetails from "../pages/customer/CustomerTicketDetails";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "../pages/Profile/Profile";
import CustomerAiAssistant from "../pages/customer/CustomerAiAssistant";
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentCompanyTicket from "../pages/agent/AgentCompanyTicket";
import AgentAssignTicket from "../pages/agent/AgentAssignTicket";
import AgentAiAssistant from "../pages/agent/AgentAiAssistant";

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
            Component: CustomerDashboard,
          },
          // Ticket List
          {
            path: "tickets",
            Component: CustomerTickets,
          },
          // Create Ticket
          {
            path: "tickets/new",
            Component: CustomerCreateTicket,
          },
          // Single Ticket
          {
            path: "tickets/:ticketId",
            Component: CustomerTicketDetails,
          },
          {
            path: "ai-assistant",
            Component: CustomerAiAssistant,
          },
          {
            path: "profile",
            Component: Profile,
          },
        ],
      },

      // agent
      {
        path: "agent",
        element: (
          <RoleRoute role="agent">
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
            Component: AgentDashboard,
          },
          {
            path: "tickets",
            Component: AgentCompanyTicket,
          },
          {
            path: "my-tickets",
            Component: AgentAssignTicket,
          },
          {
            path: "ai-assistant",
            Component: AgentAiAssistant,
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
