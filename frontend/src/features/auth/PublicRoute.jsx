
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function PublicRoute() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <p>Loading Forma...</p>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
