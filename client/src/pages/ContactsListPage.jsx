import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import ContactCard from "../components/ContactCard";

export default function ContactsListPage() {
  const [contacts, setContacts] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      const path = query ? `/api/contacts?q=${encodeURIComponent(query)}` : "/api/contacts";
      api.get(path).then(({ contacts }) => setContacts(contacts));
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: 920 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 650, letterSpacing: "-0.02em" }}>Contacts</h1>
              <div style={{ marginTop: 6, fontSize: 14, color: "var(--text-secondary)" }}>
                {contacts ? `${contacts.length} ${contacts.length === 1 ? "person" : "people"} in your network` : " "}
              </div>
            </div>
            <Link
              to="/contacts/new"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                height: 40,
                padding: "0 18px",
                background: "var(--accent)",
                borderRadius: "var(--radius-md)",
                color: "var(--accent-contrast)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Contact
            </Link>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 42,
                padding: "0 16px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search contacts"
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--text)", fontFamily: "var(--font)", flex: 1 }}
              />
            </div>
          </div>

          {contacts?.length === 0 && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "60px 24px",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              No contacts yet. Add the first person you've met.
            </div>
          )}

          {contacts?.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              {contacts.map((contact) => (
                <ContactCard key={contact._id} contact={contact} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
