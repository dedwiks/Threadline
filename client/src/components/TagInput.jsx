import { useState } from "react";

export default function TagInput({ tags, onChange }) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const value = draft.trim();
    if (!value || tags.includes(value)) {
      setDraft("");
      return;
    }
    onChange([...tags, value]);
    setDraft("");
  }

  function onKeyDown(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    addTag();
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-secondary)",
            background: "var(--surface-2)",
            padding: "5px 10px",
            borderRadius: 999,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            style={{ border: "none", background: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 0 }}
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Add a tag…"
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 13,
          color: "var(--text)",
          fontFamily: "var(--font)",
          minWidth: 100,
        }}
      />
    </div>
  );
}
