import { useState } from "react";
import { api } from "../api";

export default function IntroduceModal({ matchedContacts, onClose, onIntroduced }) {
  const [contactAId, setContactAId] = useState(null);
  const [contactBId, setContactBId] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function toggle(id) {
    setError("");
    if (id === contactAId) return setContactAId(null);
    if (id === contactBId) return setContactBId(null);
    if (!contactAId) return setContactAId(id);
    if (!contactBId) return setContactBId(id);
    // both already picked — replace the second pick
    setContactBId(id);
  }

  async function submit() {
    if (!contactAId || !contactBId) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/api/connections/introduce", { contactAId, contactBId, note });
      onIntroduced?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 420, maxWidth: "calc(100vw - 48px)", maxHeight: "80vh", display: "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", padding: "24px 26px", gap: 16 }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 650 }}>Introduce two contacts</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>Pick two of your matched contacts — both will be notified and must accept before anything is shared.</div>
        </div>

        {matchedContacts.length < 2 ? (
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>You need at least two matched contacts to introduce them to each other.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", maxHeight: 220 }}>
            {matchedContacts.map((c) => {
              const selected = c._id === contactAId || c._id === contactBId;
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => toggle(c._id)}
                  className="tl-row"
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                    background: selected ? "var(--surface-2)" : "var(--surface)",
                    fontSize: 13,
                    color: "var(--text)",
                  }}
                >
                  {c.name}
                  {c._id === contactAId && <span style={{ color: "var(--accent)", fontWeight: 600 }}> · 1st</span>}
                  {c._id === contactBId && <span style={{ color: "var(--accent)", fontWeight: 600 }}> · 2nd</span>}
                </button>
              );
            })}
          </div>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="A note for both of them…"
          rows={2}
          style={{ padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", fontSize: 13, color: "var(--text)", fontFamily: "var(--font)", resize: "vertical" }}
        />

        {error && <div style={{ fontSize: 12, color: "var(--danger)" }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={onClose} className="tl-btn-secondary" style={{ flex: 1, height: 38, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!contactAId || !contactBId || busy}
            className="tl-btn-primary"
            style={{ flex: 1, height: 38, borderRadius: "var(--radius-md)", border: "none", background: "var(--accent)", color: "var(--accent-contrast)", fontSize: 13, fontWeight: 600, opacity: !contactAId || !contactBId ? 0.5 : 1 }}
          >
            Send introduction
          </button>
        </div>
      </div>
    </div>
  );
}
