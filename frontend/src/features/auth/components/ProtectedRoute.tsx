import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/auth.types";

export default function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles: Role[];
}) {
  console.log("ProtectedRoute checking roles:", allowedRoles);
  const { user } = useAuth();
  const location = useLocation();

  if (!user?._id) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
