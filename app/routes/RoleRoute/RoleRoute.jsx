import { useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import LoadingPage from "../../../pages/loading/LoadingPage/LoadingPage";
import { Navigate, Outlet } from "react-router";

const RoleRoute = ({ role }) => {
  const { user, userRole, loading } = useContext(AuthContext);

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
