import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../../providers/AuthProvider";
import LoadingPage from "../../../pages/loading/LoadingPage/LoadingPage";

export default function DashboardRedirect() {
  const { user, loading, fetchUserRole } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);

  // ============ fetching user role ==============
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!user) {
      setUserRole(null);
      return;
    }

    const loadRole = async () => {
      const role = await fetchUserRole(user);
      setUserRole(role);
    };
    loadRole();
  }, [user]);
  // ============================

  // Auth / Role loading
  if (loading || !userRole) {
    return <LoadingPage />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (userRole) {
    case "platform":
      return <Navigate to="/platform/organizations" replace />;

    case "owner":
      return <Navigate to="/owner/dashboard" replace />;

    case "agent":
      return <Navigate to="/agent/dashboard" replace />;

    case "customer":
      return <Navigate to="/customer/dashboard" replace />;

    default:
      return <Navigate to="/" replace />;
  }
}
