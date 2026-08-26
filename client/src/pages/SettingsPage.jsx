import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api";
import Navbar from "../components/Navbar";

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

function timeAgo(dateStr) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || "");
  const [instagram, setInstagram] = useState(user?.socialLinks?.instagram || "");
  const [twitter, setTwitter] = useState(user?.socialLinks?.twitter || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/api/notifications").then(({ notifications }) => setNotifications(notifications.slice(0, 5)));
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { user: updated } = await api.patch("/api/auth/me", { username, socialLinks: { linkedin, instagram, twitter } });
      updateUser(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function toggleDiscoverable() {
    const { user: updated } = await api.patch("/api/auth/me", { discoverable: !user.discoverable });
    updateUser(updated);
  }

  return (
    <div>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 650, letterSpacing: "-0.02em" }}>Settings</h1>

          <form
            onSubmit={saveProfile}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 650 }}>Profile</div>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>Signed in as {user?.email}</div>
            </div>

            <Field label="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
              <Field label="LinkedIn" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
              <Field label="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
              <Field label="Twitter / X" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="submit"
                disabled={saving}
                className="tl-btn-primary"
                style={{ height: 38, padding: "0 18px", borderRadius: "var(--radius-md)", border: "none", background: "var(--accent)", color: "var(--accent-contrast)", fontSize: 13, fontWeight: 600, opacity: saving ? 0.6 : 1 }}
              >
                Save
              </button>
              {saved && <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Saved</span>}
            </div>
          </form>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 650 }}>Discoverable</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginTop: 4, maxWidth: 420 }}>
                Let others who have your email or LinkedIn find you as a match when they add you as a contact. You'll always be notified when it happens.
              </div>
            </div>
            <button
              type="button"
              onClick={toggleDiscoverable}
              style={{
                width: 46,
                height: 27,
                borderRadius: 999,
                background: user?.discoverable ? "var(--accent)" : "var(--border)",
                border: "none",
                position: "relative",
                flexShrink: 0,
                marginTop: 4,
                transition: "var(--transition-fast)",
              }}
            >
              <div style={{ width: 21, height: 21, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: user?.discoverable ? 22 : 3, transition: "var(--transition-fast)", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
            </button>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px" }}>
            <div style={{ fontSize: 15, fontWeight: 650, marginBottom: 4 }}>Recent notifications</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 16 }}>You're always told when someone matches to you</div>

            {notifications.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Nothing yet.</div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <div key={n._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ flex: 1, fontSize: 14, color: n.read ? "var(--text-secondary)" : "var(--text)" }}>{n.message}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{timeAgo(n.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
