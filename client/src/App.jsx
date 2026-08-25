import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import LoadingWakeup from "./components/LoadingWakeup";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import OnboardingPage from "./pages/OnboardingPage";
import ContactsListPage from "./pages/ContactsListPage";
import ContactFormPage from "./pages/ContactFormPage";
import ContactDetailPage from "./pages/ContactDetailPage";
import GraphPage from "./pages/GraphPage";

function Root() {
  const { status, user } = useAuth();
  if (status === "loading") return <LoadingWakeup />;
  if (status === "anon") return <Navigate to="/login" replace />;
  return <Navigate to={user.onboarded ? "/contacts" : "/onboarding"} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/contacts"
        element={
          <RequireAuth>
            <ContactsListPage />
          </RequireAuth>
        }
      />
      <Route
        path="/contacts/new"
        element={
          <RequireAuth>
            <ContactFormPage />
          </RequireAuth>
        }
      />
      <Route
        path="/contacts/:id"
        element={
          <RequireAuth>
            <ContactDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/contacts/:id/edit"
        element={
          <RequireAuth>
            <ContactFormPage />
          </RequireAuth>
        }
      />
      <Route
        path="/graph"
        element={
          <RequireAuth>
            <GraphPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
