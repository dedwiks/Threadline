import { useState } from "react";
import { api } from "../api";

const FIELD_LABELS = { email: "Likely email", linkedin: "Likely LinkedIn", twitter: "Likely Twitter/X" };

export default function AiSuggestionPanel({ name, company, profession, onInsert }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function requestSuggestions() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/api/ai/probable-details", { name, company, profession });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.9 4.5L18 9l-4.1 1.5L12 15l-1.9-4.5L6 9l4.1-1.5z" />
            <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600 }}>AI Autofill Suggestions</span>
        </div>
        <button
          type="button"
          onClick={requestSuggestions}
          disabled={!name.trim() || loading}
          style={{ border: "none", background: "none", fontSize: 12, fontWeight: 600, color: "var(--accent)", cursor: name.trim() ? "pointer" : "default", opacity: name.trim() ? 1 : 0.5 }}
        >
          {loading ? "Thinking…" : "Get suggestions"}
        </button>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
        Pattern-based guesses from what you've typed — unverified, not a lookup of real facts.
      </div>

      {error && <div style={{ fontSize: 12, color: "var(--danger)" }}>{error}</div>}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.keys(result.suggestions).length === 0 && (
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Not enough information to guess anything useful.</div>
          )}
          {Object.entries(result.suggestions).map(([field, suggestion]) => (
            <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: 13, color: "var(--text)" }}>
                {FIELD_LABELS[field]}: <span style={{ color: "var(--text-secondary)" }}>{suggestion.value}</span>
              </span>
              <button
                type="button"
                onClick={() => onInsert(field, suggestion.value)}
                style={{ border: "none", background: "none", fontSize: 12, fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}
              >
                Insert
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
