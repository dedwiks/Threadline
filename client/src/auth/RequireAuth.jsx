import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoadingWakeup from "../components/LoadingWakeup";

export default function RequireAuth({ children }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <LoadingWakeup />;
  }

  if (status === "anon") {
    return <Navigate to="/login" replace />;
  }

  if (!user.onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
