
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2]">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center bg-neutral-950 text-sm font-semibold text-white">
            f.
          </span>
          <span className="text-sm tracking-wide text-neutral-500">
            Loading Forma...
          </span>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
