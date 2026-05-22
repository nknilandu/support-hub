import { useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../../providers/AuthProvider";
import LoadingPage from "../../../pages/loading/LoadingPage/LoadingPage";

export default function DashboardRedirect() {
  const { user, userRole, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingPage></LoadingPage>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userRole === "owner") {
    return <Navigate to="/owner/dashboard" replace />;
  }

  if (userRole === "agent") {
    return <Navigate to="/agent/dashboard" replace />;
  }

  if (userRole === "customer") {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
}
