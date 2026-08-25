function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "6px 12px",
        borderRadius: 999,
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        color: active ? "var(--accent-contrast)" : "var(--text-secondary)",
        background: active ? "var(--accent)" : "var(--surface)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function FilterPanel({ professionOptions, tagOptions, value, onChange }) {
  const hasFilters = value.profession.length || value.tag.length || value.company || value.location;

  return (
    <div
      style={{
        width: 280,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 22,
        boxShadow: "var(--shadow-md)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, fontWeight: 650 }}>Filters</span>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => onChange({ profession: [], company: "", tag: [], location: "" })}
            style={{ border: "none", background: "none", fontSize: 12, fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}
          >
            Clear
          </button>
        ) : (
          <span />
        )}
      </div>

      {professionOptions.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 10 }}>
            Profession
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {professionOptions.map((p) => (
              <Chip key={p} active={value.profession.includes(p)} onClick={() => onChange({ ...value, profession: toggle(value.profession, p) })}>
                {p}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 10 }}>
          Company
        </div>
        <input
          value={value.company}
          onChange={(e) => onChange({ ...value, company: e.target.value })}
          placeholder="Any company"
          style={{ width: "100%", height: 38, padding: "0 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text)", fontFamily: "var(--font)" }}
        />
      </div>

      {tagOptions.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 10 }}>
            Tag
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {tagOptions.map((t) => (
              <Chip key={t} active={value.tag.includes(t)} onClick={() => onChange({ ...value, tag: toggle(value.tag, t) })}>
                {t}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 10 }}>
          Location
        </div>
        <input
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
          placeholder="Any location"
          style={{ width: "100%", height: 38, padding: "0 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text)", fontFamily: "var(--font)" }}
        />
      </div>
    </div>
  );
}
