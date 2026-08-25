import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navLinkStyle = ({ isActive }) => ({
  color: isActive ? "var(--text)" : "var(--text-secondary)",
  borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
  paddingBottom: 20,
  fontSize: 14,
  fontWeight: 500,
});

export default function Navbar() {
  const { user, logout } = useAuth();
  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        height: 64,
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        zIndex: 2,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginRight: 44 }}>
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <circle cx="9" cy="10" r="3.4" fill="var(--accent)" />
          <circle cx="23" cy="22" r="3.4" fill="var(--accent)" />
          <path d="M11 12.5C15 16.5 17 15.5 21 19.5" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
        <span style={{ fontSize: 16, fontWeight: 650, letterSpacing: "-0.02em" }}>Threadline</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <NavLink to="/contacts" style={navLinkStyle}>
          Contacts
        </NavLink>
        <NavLink to="/graph" style={navLinkStyle}>
          Graph
        </NavLink>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          title={user?.name}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          {initials}
        </div>
        <button
          type="button"
          onClick={logout}
          style={{
            border: "none",
            background: "transparent",
            color: "var(--text-tertiary)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
