import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import LoadingPage from "../../../pages/loading/LoadingPage/LoadingPage";
import { Navigate, Outlet } from "react-router";

const RoleRoute = ({ role }) => {
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
  // ===============================

  if (loading || !userRole) {
    return <LoadingPage></LoadingPage>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role?.toLowerCase() !== userRole?.toLowerCase()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet></Outlet>;
};

export default RoleRoute;
