import { Link } from "react-router-dom";

const AVATAR_PALETTE = [
  { bg: "#D9E6FB", fg: "#3C5F9E" },
  { bg: "#DCEFDE", fg: "#3E7A4C" },
  { bg: "#F5E3D3", fg: "#93602E" },
  { bg: "#E8DEF5", fg: "#6B4C93" },
  { bg: "#FBE3E8", fg: "#A34F63" },
  { bg: "#FCEBC7", fg: "#8A6A1F" },
];

function colorFor(name) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export default function ContactCard({ contact }) {
  const initials = contact.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = colorFor(contact.name);
  const roleLine = [contact.profession, contact.company].filter(Boolean).join(" · ");

  return (
    <Link
      to={`/contacts/${contact._id}`}
      className="tl-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 24px",
        borderBottom: "1px solid var(--border)",
        color: "var(--text)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: color.bg,
          color: color.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {initials}
      </div>

      <div style={{ width: 240, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 600 }}>
          {contact.name}
          {contact.matchedUserId && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </div>
        {roleLine && <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{roleLine}</div>}
      </div>

      <div style={{ width: 170, flexShrink: 0, fontSize: 13, color: "var(--text-secondary)" }}>{contact.location?.text || ""}</div>

      <div style={{ flex: 1, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(contact.tags || []).slice(0, 2).map((tag) => (
          <span key={tag} style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", background: "var(--surface-2)", padding: "5px 11px", borderRadius: 999 }}>
            {tag}
          </span>
        ))}
      </div>

      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
