import { API_URL } from "../api";

export default function LoginPage() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse 900px 500px at 50% 8%, var(--hero-glow), transparent 65%), var(--bg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <circle cx="9" cy="10" r="3.4" fill="var(--accent)" />
          <circle cx="23" cy="22" r="3.4" fill="var(--accent)" />
          <path d="M11 12.5C15 16.5 17 15.5 21 19.5" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
        <span style={{ fontSize: 20, fontWeight: 650, letterSpacing: "-0.02em" }}>Threadline</span>
      </div>

      <h1
        style={{
          margin: "36px 0 0 0",
          fontSize: 36,
          fontWeight: 650,
          letterSpacing: "-0.02em",
          maxWidth: 520,
          textAlign: "center",
          lineHeight: 1.15,
        }}
      >
        Keep track of the people you meet.
      </h1>
      <p style={{ margin: "16px 0 0 0", fontSize: 17, color: "var(--text-secondary)", maxWidth: 440, textAlign: "center", lineHeight: 1.5 }}>
        Add contacts, see how your network connects, and find them on the map.
      </p>

      <div
        style={{
          marginTop: 44,
          width: 400,
          maxWidth: "calc(100vw - 48px)",
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          padding: "40px 44px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Sign in to continue
        </div>

        <a
          href={`${API_URL}/api/auth/google`}
          className="tl-btn-secondary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            height: 48,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--text)",
            fontSize: 15,
            fontWeight: 500,
            transition: "var(--transition-fast)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .94 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
          </svg>
          Continue with Google
        </a>
      </div>
    </div>
  );
}
