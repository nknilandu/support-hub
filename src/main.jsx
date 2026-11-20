import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

import "./index.css";

// Providers
import AuthProvider from "@/providers/AuthProvider";

// Layouts
import RootLayout from "@/layouts/RootLayout";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

// Route Guards & Redirects
import PrivateRoute from "@/routes/PrivateRoute";
import RoleRoute from "@/routes/RoleRoute";
import DashboardRedirect from "@/routes/DashboardRedirect";

// Public Pages
import Home from "@/pages/public/Home";
import LegalPage from "@/pages/public/LegalPage";

// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";

// Shared Protected Pages
import Notifications from "@/pages/shared/Notifications";
import Profile from "@/pages/shared/Profile";

// Customer Pages
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import CustomerTickets from "@/pages/customer/CustomerTickets";
import CustomerCreateTicket from "@/pages/customer/CustomerCreateTicket";
import CustomerTicketDetails from "@/pages/customer/CustomerTicketDetails";
import CustomerAiAssistant from "@/pages/customer/CustomerAiAssistant";

// Agent Pages
import AgentDashboard from "@/pages/agent/AgentDashboard";
import AgentCompanyTickets from "@/pages/agent/AgentCompanyTickets";
import AgentAssignTicket from "@/pages/agent/AgentAssignTicket";
import AgentTicketDetails from "@/pages/agent/AgentTicketDetails";
import AgentAiAssistant from "@/pages/agent/AgentAiAssistant";

// Manager Pages
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ManagerTickets from "@/pages/manager/ManagerTickets";
import ManagerTicketDetails from "@/pages/manager/ManagerTicketDetails";
import ManagerAgents from "@/pages/manager/ManagerAgents";
import ManagerCustomers from "@/pages/manager/ManagerCustomers";

// Owner Pages
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import OwnerTickets from "@/pages/owner/OwnerTickets";
import OwnerTicketDetails from "@/pages/owner/OwnerTicketDetails";
import OwnerTeamRoles from "@/pages/owner/OwnerTeamRoles";
import OwnerSubscription from "@/pages/owner/OwnerSubscription";
import OwnerPaymentSuccess from "@/pages/owner/OwnerPaymentSuccess";
import OwnerPaymentCancelled from "@/pages/owner/OwnerPaymentCancelled";

// System / Error Pages
import ErrorPage from "@/pages/system/ErrorPage";
import ErrorApp from "@/pages/system/ErrorApp";

const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorApp />,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "legal",
        Component: LegalPage,
      },
    ],
  },

  // Auth Routes
  {
    path: "/",
    Component: AuthLayout,
    errorElement: <ErrorApp />,
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

  // Protected Dashboard Routes
  {
    path: "/",
    errorElement: <ErrorApp />,
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "dashboard",
        Component: DashboardRedirect,
      },
      {
        path: "notifications",
        Component: Notifications,
      },
      {
        path: "profile",
        Component: Profile,
      },

      // Customer Role
      {
        path: "customer",
        element: (
          <RoleRoute role="customer">
            <Outlet />
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
          {
            path: "tickets",
            Component: CustomerTickets,
          },
          {
            path: "tickets/new",
            Component: CustomerCreateTicket,
          },
          {
            path: "tickets/:ticketId",
            Component: CustomerTicketDetails,
          },
          {
            path: "ai-assistant",
            Component: CustomerAiAssistant,
          },
        ],
      },

      // Agent Role
      {
        path: "agent",
        element: (
          <RoleRoute role="agent">
            <Outlet />
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
            Component: AgentCompanyTickets,
          },
          {
            path: "my-tickets",
            Component: AgentAssignTicket,
          },
          {
            path: "tickets/:ticketId",
            Component: AgentTicketDetails,
          },
          {
            path: "ai-assistant",
            Component: AgentAiAssistant,
          },
        ],
      },

      // Manager Role
      {
        path: "manager",
        element: <RoleRoute role="manager" />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            Component: ManagerDashboard,
          },
          {
            path: "tickets",
            Component: ManagerTickets,
          },
          {
            path: "tickets/:ticketId",
            Component: ManagerTicketDetails,
          },
          {
            path: "agents",
            Component: ManagerAgents,
          },
          {
            path: "customers",
            Component: ManagerCustomers,
          },
        ],
      },

      // Owner Role
      {
        path: "owner",
        element: <RoleRoute role="owner" />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            Component: OwnerDashboard,
          },
          {
            path: "tickets",
            Component: OwnerTickets,
          },
          {
            path: "tickets/:ticketId",
            Component: OwnerTicketDetails,
          },
          {
            path: "team",
            Component: OwnerTeamRoles,
          },
          {
            path: "subscription",
            Component: OwnerSubscription,
          },
          {
            path: "payment-success",
            Component: OwnerPaymentSuccess,
          },
          {
            path: "payment-cancelled",
            Component: OwnerPaymentCancelled,
          },
        ],
      },
    ],
  },

  // 404 Fallback
  {
    path: "*",
    Component: ErrorPage,
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
