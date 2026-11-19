import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../../providers/AuthProvider";
import LoadingPage from "../../../pages/loading/LoadingPage/LoadingPage";

export default function DashboardRedirect() {
  const { user, loading, fetchUserRole } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setUserRole(null);
      setRoleChecked(true);
      return;
    }

    setRoleChecked(false);

    const loadRole = async () => {
      // Retry briefly in case registration DB write is still completing
      let role = await fetchUserRole(user);

      if (!role && isMounted) {
        await new Promise((r) => setTimeout(r, 800));
        role = await fetchUserRole(user);
      }

      if (isMounted) {
        setUserRole(role);
        setRoleChecked(true);
      }
    };

    loadRole();

    return () => {
      isMounted = false;
    };
  }, [user, fetchUserRole]);

  // Auth or Role loading
  if (loading || (user && !roleChecked)) {
    return <LoadingPage />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (userRole?.toLowerCase()) {
    case "owner":
      return <Navigate to="/owner/dashboard" replace />;

    case "manager":
      return <Navigate to="/manager/dashboard" replace />;

    case "agent":
      return <Navigate to="/agent/dashboard" replace />;

    case "customer":
      return <Navigate to="/customer/dashboard" replace />;

    default:
      return <Navigate to="/" replace />;
  }
}
