import { useEffect, useState } from "react";
import { api } from "../api";
import Navbar from "../components/Navbar";

const SHARE_FIELDS = [
  { key: "email", label: "Email" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "Twitter / X" },
];

const EMPTY_PERMS = { email: false, linkedin: false, instagram: false, twitter: false };

function SourceLabel({ source }) {
  return source === "introduction" ? "Introduction" : "Connection request";
}

function ConnectionRow({ connection, onChanged }) {
  const [responding, setResponding] = useState(false);
  const [perms, setPerms] = useState(EMPTY_PERMS);
  const [busy, setBusy] = useState(false);

  async function respond(response) {
    setBusy(true);
    try {
      await api.patch(`/api/connections/${connection._id}/respond`, {
        response,
        sharePermissions: response === "accepted" ? perms : undefined,
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", flexShrink: 0 }}>
          {(connection.other?.name || "?").slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{connection.other?.name || "Unknown"}</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            <SourceLabel source={connection.source} /> ·{" "}
            {connection.status === "accepted" ? "Connected" : connection.status === "declined" ? "Declined" : connection.needsMyResponse ? "Awaiting your response" : "Waiting on them"}
          </div>
        </div>
      </div>

      {connection.note && <div style={{ fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic" }}>"{connection.note}"</div>}

      {connection.needsMyResponse && !responding && (
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" disabled={busy} onClick={() => respond("declined")} className="tl-btn-ghost" style={{ height: 32, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "none", color: "var(--danger)", fontSize: 12, fontWeight: 600 }}>
            Decline
          </button>
          <button type="button" disabled={busy} onClick={() => setResponding(true)} className="tl-btn-primary" style={{ height: 32, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--accent)", color: "var(--accent-contrast)", fontSize: 12, fontWeight: 600 }}>
            Accept
          </button>
        </div>
      )}

      {responding && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Share with {connection.other?.name}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {SHARE_FIELDS.map((f) => (
              <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <input type="checkbox" checked={perms[f.key]} onChange={(e) => setPerms({ ...perms, [f.key]: e.target.checked })} />
                {f.label}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" disabled={busy} onClick={() => setResponding(false)} className="tl-btn-secondary" style={{ height: 32, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}>
              Cancel
            </button>
            <button type="button" disabled={busy} onClick={() => respond("accepted")} className="tl-btn-primary" style={{ height: 32, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--accent)", color: "var(--accent-contrast)", fontSize: 12, fontWeight: 600 }}>
              Confirm accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState(null);

  function load() {
    api.get("/api/connections").then(({ connections }) => setConnections(connections));
  }

  useEffect(load, []);

  return (
    <div>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          <h1 style={{ margin: "0 0 24px 0", fontSize: 28, fontWeight: 650, letterSpacing: "-0.02em" }}>Connection requests</h1>

          {connections === null && <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Loading…</div>}

          {connections?.length === 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "60px 24px", textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
              No connection requests yet.
            </div>
          )}

          {connections?.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              {connections.map((c) => (
                <ConnectionRow key={c._id} connection={c} onChanged={load} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
