import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
