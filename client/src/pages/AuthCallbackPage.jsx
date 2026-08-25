import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api";
import LoadingWakeup from "../components/LoadingWakeup";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get("token");
    if (!token) {
      navigate("/login?error=missing_token", { replace: true });
      return;
    }

    login(token)
      .then(() => api.get("/api/auth/me"))
      .then(({ user }) => {
        navigate(user.onboarded ? "/contacts" : "/onboarding", { replace: true });
      })
      .catch(() => navigate("/login?error=auth_failed", { replace: true }));
  }, [searchParams, navigate, login]);

  return <LoadingWakeup />;
}
