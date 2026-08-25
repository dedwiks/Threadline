import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api";

function Field({ label, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <input
        {...props}
        style={{
          height: 42,
          padding: "0 14px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)",
          background: "var(--surface-2)",
          fontSize: 14,
          color: "var(--text)",
          fontFamily: "var(--font)",
        }}
      />
    </label>
  );
}

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || "");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [availability, setAvailability] = useState("unknown"); // unknown | checking | available | taken
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username || username === user?.username) {
      setAvailability(username === user?.username ? "available" : "unknown");
      return;
    }
    setAvailability("checking");
    const handle = setTimeout(async () => {
      try {
        const { available } = await api.get(`/api/auth/username-available?u=${encodeURIComponent(username)}`);
        setAvailability(available ? "available" : "taken");
      } catch {
        setAvailability("unknown");
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [username, user?.username]);

  async function finish(e) {
    e.preventDefault();
    if (availability === "taken") return;
    setSaving(true);
    setError("");
    try {
      const { user: updated } = await api.patch("/api/auth/me", {
        username,
        socialLinks: { linkedin, instagram, twitter },
        onboarded: true,
      });
      updateUser(updated);
      navigate("/contacts", { replace: true });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  async function skip() {
    setSaving(true);
    try {
      const { user: updated } = await api.patch("/api/auth/me", { onboarded: true });
      updateUser(updated);
      navigate("/contacts", { replace: true });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const usernameHint =
    availability === "checking" ? "Checking…" : availability === "taken" ? "Already taken" : availability === "available" ? "Available" : "";
  const usernameHintColor = availability === "taken" ? "var(--danger)" : availability === "available" ? "var(--accent)" : "var(--text-tertiary)";

  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <form
        onSubmit={finish}
        style={{
          width: 440,
          maxWidth: "100%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 650, letterSpacing: "-0.02em" }}>Welcome, {user?.name?.split(" ")[0]}</h1>
          <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "var(--text-secondary)" }}>
            Pick a username and, if you'd like, add your social links — this helps Threadline recognize you if someone adds you as a contact.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Field label="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} required />
          {usernameHint && <span style={{ fontSize: 12, color: usernameHintColor }}>{usernameHint}</span>}
        </div>

        <Field label="LinkedIn" placeholder="linkedin.com/in/you" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
        <Field label="Instagram" placeholder="@you" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        <Field label="Twitter / X" placeholder="@you" value={twitter} onChange={(e) => setTwitter(e.target.value)} />

        {error && <div style={{ fontSize: 13, color: "var(--danger)" }}>{error}</div>}

        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <button
            type="button"
            onClick={skip}
            disabled={saving}
            style={{
              flex: 1,
              height: 44,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Skip
          </button>
          <button
            type="submit"
            disabled={saving || availability === "taken" || availability === "checking"}
            style={{
              flex: 1,
              height: 44,
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--accent)",
              color: "var(--accent-contrast)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              opacity: saving || availability === "taken" ? 0.6 : 1,
            }}
          >
            Finish
          </button>
        </div>
      </form>
    </div>
  );
}
