import { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../../providers/AuthProvider";
import LoadingPage from "../../../pages/loading/LoadingPage/LoadingPage";

const AuthLayout = () => {
  const { user, loading } = useContext(AuthContext);

  // ========= for theme control ==========
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // =====================
  if (loading) {
    return <LoadingPage></LoadingPage>;
  } else if (user) {
    return <Navigate to="/" replace />;
  } else {
    return (
      <div>
        <Outlet></Outlet>
      </div>
    );
  }
};

export default AuthLayout;
