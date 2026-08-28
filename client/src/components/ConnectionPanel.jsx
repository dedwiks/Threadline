import { useEffect, useState } from "react";
import { api } from "../api";

const SHARE_FIELDS = [
  { key: "email", label: "Email" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "Twitter / X" },
];

function PermissionCheckboxes({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
      {SHARE_FIELDS.map((f) => (
        <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)" }}>
          <input
            type="checkbox"
            checked={Boolean(value[f.key])}
            onChange={(e) => onChange({ ...value, [f.key]: e.target.checked })}
          />
          {f.label}
        </label>
      ))}
    </div>
  );
}

const EMPTY_PERMS = { email: false, linkedin: false, instagram: false, twitter: false };

export default function ConnectionPanel({ matchedUserId, fallbackName }) {
  const [data, setData] = useState(null);
  const [mode, setMode] = useState(null); // null | "requesting" | "responding" | "managing"
  const [note, setNote] = useState("");
  const [perms, setPerms] = useState(EMPTY_PERMS);
  const [busy, setBusy] = useState(false);

  function load() {
    api.get(`/api/connections/with/${matchedUserId}`).then((d) => {
      setData(d);
      setPerms(d.connection?.mySharePermissions || EMPTY_PERMS);
    });
  }

  useEffect(() => {
    load();
    setMode(null);
  }, [matchedUserId]);

  if (!data) return null;

  const { connection, otherUser, sharedByOther } = data;
  const displayName = otherUser?.name || fallbackName;

  async function sendRequest() {
    setBusy(true);
    try {
      await api.post("/api/connections/request", { toUserId: matchedUserId, note, sharePermissions: perms });
      setMode(null);
      setNote("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function respond(response) {
    setBusy(true);
    try {
      await api.patch(`/api/connections/${connection._id}/respond`, {
        response,
        sharePermissions: response === "accepted" ? perms : undefined,
      });
      setMode(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function savePermissions() {
    setBusy(true);
    try {
      await api.patch(`/api/connections/${connection._id}/permissions`, { sharePermissions: perms });
      setMode(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>Connection</div>

      {!connection && mode !== "requesting" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Not connected with {displayName} yet.</span>
          <button type="button" className="tl-text-link" onClick={() => setMode("requesting")} style={{ border: "none", background: "none", fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
            Connect with {displayName}
          </button>
        </div>
      )}

      {!connection && mode === "requesting" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`A note for ${displayName}…`}
            rows={2}
            style={{ padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", fontSize: 13, color: "var(--text)", fontFamily: "var(--font)", resize: "vertical" }}
          />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
              Share with {displayName}
            </div>
            <PermissionCheckboxes value={perms} onChange={setPerms} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="tl-btn-secondary" disabled={busy} onClick={() => setMode(null)} style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}>
              Cancel
            </button>
            <button type="button" className="tl-btn-primary" disabled={busy} onClick={sendRequest} style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--accent)", color: "var(--accent-contrast)", fontSize: 12, fontWeight: 600 }}>
              Send request
            </button>
          </div>
        </div>
      )}

      {connection && connection.status === "pending" && connection.myResponse === "pending" && mode !== "responding" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, color: "var(--text)" }}>
            <strong>{displayName}</strong> {connection.source === "introduction" ? "was introduced to you" : "wants to connect"}.
          </div>
          {connection.note && <div style={{ fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic" }}>"{connection.note}"</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" disabled={busy} onClick={() => respond("declined")} className="tl-btn-ghost" style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "none", color: "var(--danger)", fontSize: 12, fontWeight: 600 }}>
              Decline
            </button>
            <button type="button" disabled={busy} onClick={() => setMode("responding")} className="tl-btn-primary" style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--accent)", color: "var(--accent-contrast)", fontSize: 12, fontWeight: 600 }}>
              Accept
            </button>
          </div>
        </div>
      )}

      {connection && mode === "responding" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Share with {displayName}
          </div>
          <PermissionCheckboxes value={perms} onChange={setPerms} />
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="tl-btn-secondary" disabled={busy} onClick={() => setMode(null)} style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}>
              Cancel
            </button>
            <button type="button" className="tl-btn-primary" disabled={busy} onClick={() => respond("accepted")} style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--accent)", color: "var(--accent-contrast)", fontSize: 12, fontWeight: 600 }}>
              Confirm accept
            </button>
          </div>
        </div>
      )}

      {connection && connection.status === "pending" && connection.myResponse !== "pending" && (
        <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Request sent — waiting for {displayName}.</div>
      )}

      {connection && connection.status === "accepted" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sharedByOther && Object.keys(sharedByOther).length > 0 ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                Shared by {displayName}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(sharedByOther).map(([field, value]) => (
                  <div key={field} style={{ fontSize: 13, color: "var(--text)" }}>
                    {SHARE_FIELDS.find((f) => f.key === field)?.label}: <span style={{ color: "var(--text-secondary)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{displayName} hasn't shared any details with you yet.</div>
          )}

          {mode !== "managing" ? (
            <button type="button" className="tl-text-link" onClick={() => setMode("managing")} style={{ alignSelf: "flex-start", border: "none", background: "none", fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
              Manage what you share
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                You share with {displayName}
              </div>
              <PermissionCheckboxes value={perms} onChange={setPerms} />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="tl-btn-secondary" disabled={busy} onClick={() => setMode(null)} style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="button" className="tl-btn-primary" disabled={busy} onClick={savePermissions} style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--accent)", color: "var(--accent-contrast)", fontSize: 12, fontWeight: 600 }}>
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {connection && connection.status === "declined" && (
        <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Connection request declined.</div>
      )}
    </div>
  );
}
