import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";

function InfoRow({ icon, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text)" }}>
      {icon}
      {children}
    </div>
  );
}

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);

  useEffect(() => {
    api.get(`/api/contacts/${id}`).then(({ contact }) => setContact(contact));
  }, [id]);

  async function onDelete() {
    if (!window.confirm(`Delete ${contact.name}? This can't be undone.`)) return;
    await api.delete(`/api/contacts/${id}`);
    navigate("/contacts");
  }

  if (!contact) {
    return (
      <div>
        <Navbar />
      </div>
    );
  }

  const initials = contact.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const roleLine = [contact.profession, contact.company].filter(Boolean).join(" · ");

  return (
    <div>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: 820, display: "flex", gap: 40 }}>
          <div style={{ width: 220, flexShrink: 0 }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                background: "#D9E6FB",
                color: "#3C5F9E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              {initials}
            </div>
            <h1 style={{ margin: "18px 0 4px 0", fontSize: 24, fontWeight: 650, letterSpacing: "-0.02em" }}>{contact.name}</h1>
            {roleLine && <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{roleLine}</div>}

            {contact.matchedUserId && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Matched to a Threadline account
              </div>
            )}

            {contact.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                {contact.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", background: "var(--surface-2)", padding: "5px 11px", borderRadius: 999 }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
              {contact.email && <InfoRow>{contact.email}</InfoRow>}
              {contact.phone && <InfoRow>{contact.phone}</InfoRow>}
              {contact.location?.text && <InfoRow>{contact.location.text}</InfoRow>}
              {contact.linkedin && <InfoRow>{contact.linkedin}</InfoRow>}
              {contact.instagram && <InfoRow>{contact.instagram}</InfoRow>}
              {contact.twitter && <InfoRow>{contact.twitter}</InfoRow>}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <Link
                to={`/contacts/${id}/edit`}
                style={{ flex: 1, textAlign: "center", height: 38, lineHeight: "38px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={onDelete}
                style={{ flex: 1, height: 38, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--danger)", cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
            {(contact.howWeMet || contact.metDate) && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "22px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>How we met</div>
                {contact.howWeMet && <div style={{ fontSize: 14, lineHeight: 1.6 }}>{contact.howWeMet}</div>}
                {contact.metDate && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-tertiary)" }}>
                    {new Date(contact.metDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                )}
              </div>
            )}

            {contact.notes && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "22px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Notes</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{contact.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
