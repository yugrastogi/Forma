
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./features/home/Home";

import Login from "./features/auth/Login";
import Signup from "./features/auth/Signup";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import PublicRoute from "./features/auth/PublicRoute";
import { useAuthStore } from "./stores/authStore";

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);


  return (
    <Routes>
      <Route element={<PublicRoute />}>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
